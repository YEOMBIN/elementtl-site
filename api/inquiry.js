/* 제품 도입 문의 / 데모 신청 접수 API (Vercel Serverless Function)
   담당자 수신 이메일과 발송 서비스 키가 환경변수로 설정되기 전까지는 503을 반환합니다.
   (미설정 상태에서 접수 완료로 처리하지 않습니다 · 입력 내용은 저장하지 않고 이메일로만 전달합니다)
   필요 환경변수: INQUIRY_TO(담당자 수신 이메일) · INQUIRY_FROM(발신 주소, 발송 서비스에서 인증된 주소) · RESEND_API_KEY */
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LABEL = { name: '신청자명', org: '의료기관명', region: '지역', tel: '연락처', mail: '이메일', msg: '문의 내용', addr: '방문 주소', d1: '희망 일자(1순위)', d2: '희망 일자(2순위)', time: '희망 시간대', ppl: '참석 예정 인원', waves: '관심 파장' };

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method_not_allowed' }); }
  const { INQUIRY_TO, INQUIRY_FROM, RESEND_API_KEY } = process.env;
  if (!INQUIRY_TO || !INQUIRY_FROM || !RESEND_API_KEY) return res.status(503).json({ ok: false, error: 'not_configured' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object' || b.website) return res.status(400).json({ ok: false, error: 'bad_request' });
  const type = b.type === 'demo' ? '데모 신청' : '제품 도입 문의';
  const f = b.fields && typeof b.fields === 'object' ? b.fields : {};
  const isDemo = b.type === 'demo';
  const clean = v => (typeof v === 'string' ? v.trim() : '');
  if (!clean(f.name) || !clean(f.org) || !clean(f.tel) || (isDemo && !clean(f.region)) || b.consent !== true) return res.status(400).json({ ok: false, error: 'missing_required' });
  const labels = isDemo ? { ...LABEL, region: '방문 지역', d1: '희망 날짜' } : LABEL;
  const rows = Object.keys(isDemo ? { org: 1, name: 1, tel: 1, region: 1, d1: 1 } : LABEL).filter(k => f[k]).map(k => `<tr><th align="left" style="padding:4px 12px 4px 0">${labels[k]}</th><td>${esc(Array.isArray(f[k]) ? f[k].join(', ') : f[k]).slice(0, 4000)}</td></tr>`).join('');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: INQUIRY_FROM, to: INQUIRY_TO.split(',').map(s => s.trim()), reply_to: f.mail || undefined, subject: `[엘레멘트티엘] ${type} - ${String(f.org).slice(0, 60)}`, html: `<h3>${type}</h3><table>${rows}</table>` })
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'send_failed' });
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(502).json({ ok: false, error: 'send_failed' }); }
};
