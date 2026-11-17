/* 제품 도입 문의 / 데모 신청 접수 API (Vercel Serverless Function) — Nodemailer + SMTP
   필요 환경변수(서버 전용, 코드·GitHub·프론트엔드에 두지 않음):
     SMTP_HOST · SMTP_PORT · SMTP_USER · SMTP_PASSWORD · MAIL_FROM · MAIL_TO
   하나라도 설정되지 않으면 503(접수 비활성화)을 반환하며 접수 완료로 처리하지 않습니다.
   입력 내용은 DB·로그에 저장하지 않고 이메일로만 전달합니다. */
const nodemailer = require('nodemailer');

const FORMS = {
  inquiry: {
    subject: '[엘레멘트티엘] 홈페이지 제품 도입 문의',
    fields: [['name', '신청자명'], ['org', '의료기관명'], ['region', '지역'], ['tel', '연락처'], ['mail', '이메일'], ['msg', '문의 내용']],
    required: ['name', 'org', 'region', 'tel', 'mail'],
  },
  demo: {
    subject: '[엘레멘트티엘] 홈페이지 데모 신청',
    fields: [['org', '의료기관명'], ['name', '담당자명'], ['tel', '연락처'], ['region', '방문 지역'], ['d1', '희망 날짜']],
    required: ['org', 'name', 'tel', 'region'],
  },
};
const MAX = { msg: 2000 }, MAX_DEFAULT = 200;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = s => String(s).replace(new RegExp('[' + String.fromCharCode(13,10,0x2028,0x2029) + ']+', 'g'), ' ').trim();

/* 스팸·중복 방지 (서버리스 인스턴스 메모리 기준의 best-effort) */
const hits = new Map();      // ip -> [timestamps]
const sent = new Map();      // payload hash -> timestamp
const RATE_WINDOW = 10 * 60 * 1000, RATE_MAX = 5, DUP_WINDOW = 10 * 60 * 1000;
const prune = (now) => { for (const [k, t] of sent) if (now - t > DUP_WINDOW) sent.delete(k); for (const [k, a] of hits) { const r = a.filter(t => now - t < RATE_WINDOW); if (r.length) hits.set(k, r); else hits.delete(k); } };

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method_not_allowed' }); }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, MAIL_TO } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !MAIL_FROM || !MAIL_TO) return res.status(503).json({ ok: false, error: 'not_configured' });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object' || JSON.stringify(b).length > 20000) return res.status(400).json({ ok: false, error: 'bad_request' });

  /* 스팸: 허니팟, 너무 빠른 제출 */
  if (b.website) return res.status(400).json({ ok: false, error: 'bad_request' });
  if (!(Number(b.elapsed) >= 2500)) return res.status(400).json({ ok: false, error: 'too_fast' });

  const type = b.type === 'demo' ? 'demo' : 'inquiry';
  const form = FORMS[type];
  const f = b.fields && typeof b.fields === 'object' ? b.fields : {};
  if (b.consent !== true) return res.status(400).json({ ok: false, error: 'consent_required' });

  /* 값 검증 · 정리 (문자열만, 길이 제한, 제어문자 제거) */
  const v = {};
  for (const [k] of form.fields) {
    let x = f[k];
    if (x == null || x === '') continue;
    if (typeof x !== 'string') return res.status(400).json({ ok: false, error: 'invalid_' + k });
    x = x.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
    if (k !== 'msg') x = oneLine(x);
    if (x.length > (MAX[k] || MAX_DEFAULT)) return res.status(400).json({ ok: false, error: 'too_long_' + k });
    if (x) v[k] = x;
  }
  for (const k of form.required) if (!v[k]) return res.status(400).json({ ok: false, error: 'missing_' + k });
  if (v.tel && !/^[0-9+\-\s()]{9,20}$/.test(v.tel)) return res.status(400).json({ ok: false, error: 'invalid_tel' });
  if (v.mail && !/^[^\s@<>",;:]+@[^\s@<>",;:]+\.[^\s@<>",;:]+$/.test(v.mail)) return res.status(400).json({ ok: false, error: 'invalid_mail' });
  if (v.d1 && !/^\d{4}-\d{2}-\d{2}$/.test(v.d1)) return res.status(400).json({ ok: false, error: 'invalid_d1' });

  /* 속도 제한 · 중복 제출 */
  const now = Date.now(); prune(now);
  const ip = String((req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'])) || '').split(',')[0].trim() || 'unknown';
  const arr = hits.get(ip) || [];
  if (arr.length >= RATE_MAX) return res.status(429).json({ ok: false, error: 'rate_limited' });
  const key = require('crypto').createHash('sha256').update(JSON.stringify([type, v])).digest('hex');
  if (sent.has(key)) return res.status(200).json({ ok: true, duplicate: true });
  hits.set(ip, [...arr, now]);

  /* 메일 본문 (양식의 필드명 그대로) */
  const when = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false });
  const rows = form.fields.filter(([k]) => v[k]);
  const text = ['문의 접수 일시: ' + when + ' (KST)', '', ...rows.map(([k, l]) => l + ': ' + v[k])].join('\n');
  const html = '<div style="font-family:Arial,\'Malgun Gothic\',sans-serif;font-size:14px;line-height:1.6;color:#111">'
    + '<p style="margin:0 0 12px"><b>문의 접수 일시</b>: ' + esc(when) + ' (KST)</p>'
    + '<table style="border-collapse:collapse">' + rows.map(([k, l]) => '<tr><th align="left" valign="top" style="padding:6px 16px 6px 0;white-space:nowrap">' + esc(l) + '</th><td style="padding:6px 0;white-space:pre-wrap">' + esc(v[k]) + '</td></tr>').join('') + '</table></div>';

  try {
    const port = Number(SMTP_PORT);
    const transporter = nodemailer.createTransport({ host: oneLine(SMTP_HOST), port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
    await transporter.sendMail({
      from: oneLine(MAIL_FROM),
      to: MAIL_TO.split(',').map(oneLine).filter(Boolean),
      replyTo: v.mail || undefined,
      subject: form.subject,
      text,
      html,
    });
    sent.set(key, now);
    return res.status(200).json({ ok: true });
  } catch (e) {
    hits.set(ip, (hits.get(ip) || []).slice(0, -1)); // 실패한 시도는 속도 제한에서 제외
    console.error('smtp_send_failed', e && e.code ? e.code : 'unknown'); // 개인정보는 로그에 남기지 않음
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
};
