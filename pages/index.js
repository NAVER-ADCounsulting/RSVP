import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwyK60VZMdPvwK4OHolLd27GuWZwUT2D5ULoZYXNVLK2wzKvec0H3jDC2E6oCbN6kh5/exec'
const SUBMIT_TOKEN = '06df63acacdda695707f479ca241b4c14f4cc74501e8cdac'

const S = {
  zh: {
    eventDate: '2026.7.28 (周二)', eventVenue: '上虹桥金沙 voco酒店 会议室 2',
    inviteTitle: '诚邀您参与', formSubtitle: '请填写以下信息，确认您的出席意向',
    lCompany: '公司名称', lName: '姓名', lJob: '职位 / 业务', lEmail: '电子邮件',
    lAttend: '出席情况', lComp: '同行人数',
    phCompany: '请输入公司名称', phName: '请输入您的姓名', phJob: '请输入您的职位或业务范围',
    optAttend: '参加', optNot: '不参加', optMaybe: '待定', optJustMe: '仅本人', optPlus3: '+3以上',
    btnSubmit: '提交确认', errReq: '此项为必填项', errEmail: '请输入有效的电子邮件地址',
    successTitle: '感谢您的回复！', successMsg: '我们已收到您的确认，期待与您共赴这场韩国市场盛会！',
    benefitsLabel: '参会专属福利', b1: 'NAVER 广告免费 Credits',
    b2: 'WEBTOON 广告主打产品', b2sub: '核心广告位优先供给',
    bNote: '*Q3内在NAVER平台进行付费投放即可享受',
  },
  en: {
    eventDate: 'July 28, 2026 (Tue)', eventVenue: 'Hongqiao Jinsha voco Hotel, Room 2, Shanghai',
    inviteTitle: "You're Invited", formSubtitle: 'Please complete the form to confirm your attendance',
    lCompany: 'Company Name', lName: 'Full Name', lJob: 'Job Title / Role', lEmail: 'Email Address',
    lAttend: 'Attendance', lComp: 'Additional Attendees',
    phCompany: 'Enter your company name', phName: 'Enter your full name', phJob: 'Enter your job title or role',
    optAttend: 'Attending', optNot: 'Not Attending', optMaybe: 'Undecided', optJustMe: 'Just me', optPlus3: '+3 or more',
    btnSubmit: 'Submit RSVP', errReq: 'This field is required', errEmail: 'Please enter a valid email address',
    successTitle: 'Thank you!', successMsg: "We've received your RSVP. Looking forward to seeing you at the event!",
    benefitsLabel: 'EVENT BENEFITS', b1: 'Free NAVER Ad Credits',
    b2: 'WEBTOON Premium Ad Products', b2sub: 'Priority access to key ad inventory',
    bNote: '*Available for advertisers running paid NAVER campaigns in Q3',
  },
  ko: {
    eventDate: '2026.7.28 (화)', eventVenue: '상하이 홍차오 진샤 voco 호텔 회의실 2',
    inviteTitle: '여러분을 초대합니다', formSubtitle: '아래 양식을 작성하여 참석 여부를 알려주세요',
    lCompany: '회사명', lName: '이름', lJob: '담당 업무', lEmail: '이메일',
    lAttend: '참석 여부', lComp: '동반 참석 인원',
    phCompany: '회사명을 입력해주세요', phName: '성함을 입력해주세요', phJob: '담당 업무를 입력해주세요',
    optAttend: '참석', optNot: '불참', optMaybe: '미정', optJustMe: '본인만', optPlus3: '+3명 이상',
    btnSubmit: '제출하기', errReq: '필수 항목입니다', errEmail: '유효한 이메일 주소를 입력해주세요',
    successTitle: '감사합니다!', successMsg: '참석 여부가 등록되었습니다. 행사에서 뵙겠습니다!',
    benefitsLabel: '참석 혜택', b1: '네이버 광고 무료 크레딧',
    b2: '웹툰 광고 메인 상품', b2sub: '핵심 광고 지면 제공',
    bNote: '*3분기 내 네이버 광고 유상 집행 시 제공',
  },
}

export default function RSVPPage() {
  const [lang, setLang] = useState('zh')
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [attendance, setAttendance] = useState('')
  const [companions, setCompanions] = useState('just_me')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const canvasRef = useRef(null)
  const s = S[lang]

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === 'undefined') return
    const ctx = canvas.getContext('2d')
    let W, H
    const pts = []
    const N = 55, D = 130
    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    function r(a, b) { return a + (b - a) * Math.random() }
    for (let i = 0; i < N; i++) {
      pts.push({ x: r(0, window.innerWidth), y: r(0, window.innerHeight), vx: r(-0.2, 0.2), vy: r(-0.2, 0.2), rad: r(1, 2.1), o: r(0.15, 0.5) })
    }
    let animId
    function tick() {
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < D) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d / D) * 0.11})`; ctx.lineWidth = 0.8; ctx.stroke()
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(120,200,255,${p.o})`; ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
      })
      animId = requestAnimationFrame(tick)
    }
    tick()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])

  // Close lang menu on outside click
  useEffect(() => {
    function handler(e) { if (!e.target.closest('.lang-dropdown')) setLangMenuOpen(false) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const company = form.company.value.trim()
    const fullname = form.fullname.value.trim()
    const jobtitle = form.jobtitle.value.trim()
    const email = form.email.value.trim()

    const newErrors = {}
    if (!company) newErrors.company = s.errReq
    if (!fullname) newErrors.fullname = s.errReq
    if (!jobtitle) newErrors.jobtitle = s.errReq
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = s.errEmail
    if (!attendance) newErrors.attendance = s.errReq
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ company, name: fullname, jobTitle: jobtitle, email, attendance,
          companions: attendance === 'attending' ? companions : '-',
          language: lang, timestamp: new Date().toISOString(), token: SUBMIT_TOKEN }),
      })
      setSubmitted(true)
    } catch { setLoading(false) }
  }

  return (
    <>
      <Head>
        <title>RSVP | 2026 NAVER MARKETING DAY - Road to Korea</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@1,700;1,900&display=swap" rel="stylesheet" />
      </Head>

      {/* Backgrounds */}
      <div className="bg-gradient" />
      <div className="bg-dots" />
      <div className="bg-scanlines" />
      <canvas ref={canvasRef} className="particle-canvas" />
      <div className="glow-orb orb-1" /><div className="glow-orb orb-2" /><div className="glow-orb orb-3" />
      <div className="deco-ring ring-1" /><div className="deco-ring ring-2" />
      <div className="deco-ring ring-3" /><div className="deco-ring ring-4" />
      <div className="deco-line-tl" /><div className="deco-line-br" />

      {/* Top bar */}
      <div className="top-bar">
        <div className="brand-row">
          <span className="brand-name brand-naver">NAVER</span>
          <div className="brand-sep" />
          <span className="brand-name brand-webtoon">WEBTOON</span>
          <div className="brand-sep" />
          <span className="brand-name brand-madhouse">MADhouse</span>
        </div>
        <div className="lang-dropdown">
          <button className="lang-btn" onClick={() => setLangMenuOpen(v => !v)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{{ zh: '中文', en: 'English', ko: '한국어' }[lang]}</span>
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {langMenuOpen && (
            <div className="lang-menu open">
              {[['zh', '🇨🇳', '中文'], ['en', '🇺🇸', 'English'], ['ko', '🇰🇷', '한국어']].map(([l, flag, label]) => (
                <div key={l} className={`lang-option${lang === l ? ' active' : ''}`}
                  onClick={() => { setLang(l); setLangMenuOpen(false) }}>
                  <span className="flag">{flag}</span> {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="page-wrap">
        {/* Hero */}
        <section className="hero">
          <div className="n-cube-wrap">
            <div className="n-cube">
              <div className="n-cube-glow" />
              <div className="n-cube-inner">N</div>
            </div>
          </div>
          <div className="event-eyebrow">2026</div>
          <div className="event-name">NAVER MARKETING DAY</div>
          <div className="event-subtitle">Road to Korea</div>
          <div className="event-datetime">
            <span>{s.eventDate}</span>
            <span className="dt-sep">·</span>
            <span>14:00~16:00</span>
            <span className="dt-sep">|</span>
            <span>{s.eventVenue}</span>
          </div>
        </section>

        {/* RSVP Form */}
        <section className="form-section">
          {submitted ? (
            <div className="success-view show">
              <div className="success-icon">✓</div>
              <div className="success-title">{s.successTitle}</div>
              <div className="success-msg">{s.successMsg}</div>
            </div>
          ) : (
            <>
              <div className="form-header">
                <div className="form-invite">{s.inviteTitle}</div>
                <div className="form-subtitle">{s.formSubtitle}</div>
              </div>
              <form onSubmit={handleSubmit} noValidate>
                {[
                  ['company', 'text', s.lCompany, s.phCompany, 'company'],
                  ['fullname', 'text', s.lName, s.phName, 'fullname'],
                  ['jobtitle', 'text', s.lJob, s.phJob, 'jobtitle'],
                  ['email', 'email', s.lEmail, 'example@company.com', 'email'],
                ].map(([id, type, label, ph, errKey]) => (
                  <div className="form-group" key={id}>
                    <label className="form-label" htmlFor={id}>{label}<span className="req">*</span></label>
                    <input type={type} id={id} name={id}
                      className={`form-input${errors[errKey] ? ' error' : ''}`}
                      placeholder={ph}
                      onChange={() => setErrors(prev => ({ ...prev, [errKey]: '' }))} />
                    {errors[errKey] && <div className="error-msg show">{errors[errKey]}</div>}
                  </div>
                ))}

                {/* Attendance */}
                <div className="form-group">
                  <label className="form-label">{s.lAttend}<span className="req">*</span></label>
                  <div className="attendance-grid">
                    {[['attending', '✅', s.optAttend, ''], ['not_attending', '❌', s.optNot, 'not'], ['undecided', '🤔', s.optMaybe, 'maybe']].map(([val, em, label, cls]) => (
                      <div key={val} className="radio-card">
                        <input type="radio" name="attendance" id={`r-${val}`} value={val} checked={attendance === val}
                          onChange={() => { setAttendance(val); setErrors(p => ({ ...p, attendance: '' })) }} />
                        <label className={`radio-label${cls ? ` ${cls}` : ''}`} htmlFor={`r-${val}`}>
                          <span className="em">{em}</span><span>{label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.attendance && <div className="error-msg show">{errors.attendance}</div>}
                </div>

                {/* Companions */}
                <div className={`companion-section${attendance === 'attending' ? ' visible' : ''}`}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{s.lComp}</label>
                    <div className="companion-grid">
                      {[['just_me', s.optJustMe], ['+1', '+1'], ['+2', '+2'], ['+3', s.optPlus3]].map(([val, label]) => (
                        <div key={val} className="comp-option">
                          <input type="radio" name="companions" id={`c-${val}`} value={val} checked={companions === val}
                            onChange={() => setCompanions(val)} />
                          <label className="comp-label" htmlFor={`c-${val}`}>{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className={`submit-btn${loading ? ' loading' : ''}`} disabled={loading}>
                  <span className="btn-text">{s.btnSubmit}</span>
                  <span className="btn-spinner" />
                </button>
              </form>
            </>
          )}
        </section>

        {/* Benefits */}
        <div className="benefits-section">
          <div className="benefits-title">{s.benefitsLabel}</div>
          <div className="benefit-item">
            <span className="benefit-emoji">🎁</span>
            <span>{s.b1}</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-emoji">🎁</span>
            <span>{s.b2}<br /><span className="benefit-sub">{s.b2sub}</span></span>
          </div>
          <div className="benefits-note">{s.bNote}</div>
        </div>

        <footer className="footer">
          <p>© 2026 NAVER Corp. All rights reserved.</p>
        </footer>
      </div>
    </>
  )
}
