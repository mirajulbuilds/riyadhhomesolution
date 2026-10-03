import { RHS_MARK_BOX, rhsMarkReversed } from '../icons/rhs-mark'

/* Technician torso geometry (viewBox units). The chest print is computed from these. */
const TORSO = { x: 218, y: 280, width: 64, height: 90 }
const STRIPE = { y: 306, height: 5 }
const HEM = { x: 220, y: 354, width: 60, height: 8 }

/**
 * Chest print: the real RHS mark, 52.8 units wide (2.2× the first 24-unit version), centred on
 * the torso's centre line (x 250, shared with the V-collar and head) and midway between the
 * stripe and the hem (y 332.5). Box: x 223.6–276.4, y 313.6–351.4, clear of the stripe and hem
 * by ~2.6 and of the torso edges by 5.6. The front arm's inner edge stays ≥ 11 units from the
 * S in this pose.
 * Phase 4: the logo sits inside the torso group, so it tilts with the torso; arm poses (walk
 * cycle, reaching up) must keep arm-front from crossing that box.
 */
const CHEST_LOGO_WIDTH = 52.8
const chestLogo = (() => {
  const scale = CHEST_LOGO_WIDTH / RHS_MARK_BOX.width
  const height = RHS_MARK_BOX.height * scale
  const centreX = TORSO.x + TORSO.width / 2
  const centreY = (STRIPE.y + STRIPE.height + HEM.y) / 2
  const fixed = (n: number, digits: number) => Number(n.toFixed(digits))
  const x = fixed(centreX - CHEST_LOGO_WIDTH / 2, 3)
  const y = fixed(centreY - height / 2, 3)
  return { transform: `translate(${x} ${y}) scale(${fixed(scale, 6)}) translate(${-RHS_MARK_BOX.x} ${-RHS_MARK_BOX.y})` }
})()

/**
 * Hero room illustration (brief §8.2), drawn as layered inline SVG.
 *
 * Phase 2 shows the static "done" state: every light on with soft cones, tap fixed (green
 * check), CCTV LED on, technician giving a thumbs-up beside the toolbox. Every part that
 * Phase 4 animates is its own group with a data-part name (lights, drip, tap handle, camera,
 * technician limbs, toolbox), so the story timeline can target them directly.
 *
 * Never mirrored: the scene looks identical in Arabic and English (direction is forced to ltr;
 * only the hero column it sits in changes side). Same rule for every illustration and photo.
 * Phase 4: the story animation must also run in the same direction in both languages (the
 * technician always walks in from the same side), overriding the brief's "reading-start side".
 */
export function HeroScene({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 640 480" role="img" aria-label={label} direction="ltr" style={{ direction: 'ltr' }} className="block h-auto w-full">
      <defs>
        <linearGradient id="hs-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE3A3" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFE3A3" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FD3EE" />
          <stop offset="1" stopColor="#E3F3FB" />
        </linearGradient>
        <linearGradient id="hs-scan" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E5484D" stopOpacity="0.28" />
          <stop offset="1" stopColor="#E5484D" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* room */}
      <rect width="640" height="480" fill="#F6F2EB" />
      <rect y="404" width="640" height="76" fill="#E9E0D2" />
      <rect y="400" width="640" height="8" fill="#DCD1C0" />
      <path d="M0 440h640M120 408l-40 72M260 408l-14 72M400 408l14 72M540 408l40 72" stroke="#DCD1C0" strokeWidth="2" />

      {/* window */}
      <g data-part="window">
        <rect x="44" y="104" width="134" height="150" rx="10" fill="#FFFFFF" />
        <rect x="54" y="114" width="114" height="130" rx="6" fill="url(#hs-sky)" />
        <circle cx="140" cy="140" r="14" fill="#FFF4D6" />
        <path d="M70 196c10-10 24-10 32 0 8-6 20-4 24 6H66c0-3 1-5 4-6z" fill="#FFFFFF" opacity="0.9" />
        <path d="M111 114v130M54 179h114" stroke="#FFFFFF" strokeWidth="6" />
        <rect x="38" y="250" width="146" height="10" rx="4" fill="#E7DED0" />
      </g>

      {/* mirror */}
      <g data-part="mirror">
        <path d="M434 246V164a52 52 0 0 1 104 0v82z" fill="#DDEBF2" stroke="#C9D5DC" strokeWidth="4" />
        <path d="M456 230l38-60M476 236l26-40" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* light cones (behind the furniture) */}
      <g data-part="cones">
        <path data-part="cone-1" d="M126 60h28l84 252H42z" fill="url(#hs-cone)" />
        <path data-part="cone-2" d="M316 60h28l84 252H232z" fill="url(#hs-cone)" />
        <path data-part="cone-3" d="M506 60h28l84 252H422z" fill="url(#hs-cone)" />
      </g>

      {/* ceiling + spotlights; light-2 is the faulty one that flickers in the story */}
      <rect width="640" height="58" fill="#EEE7DC" />
      <rect y="56" width="640" height="4" fill="#E0D6C6" />
      {[140, 330, 520].map((x, i) => (
        <g key={x} data-part={`light-${i + 1}`}>
          <ellipse cx={x} cy="60" rx="20" ry="6" fill="#FFFFFF" stroke="#D8CEBD" strokeWidth="2" />
          <ellipse data-part="glow" cx={x} cy="61" rx="11" ry="3.5" fill="#FFD27A" />
        </g>
      ))}

      {/* wall socket */}
      <g data-part="socket">
        <rect x="338" y="338" width="34" height="34" rx="7" fill="#FFFFFF" stroke="#D6CCBC" strokeWidth="2" />
        <circle cx="349" cy="355" r="3" fill="#9AA5B1" />
        <circle cx="361" cy="355" r="3" fill="#9AA5B1" />
      </g>

      {/* vanity with basin and tap */}
      <g data-part="vanity">
        <rect x="402" y="318" width="168" height="90" rx="6" fill="#FFFFFF" stroke="#DCD3C4" strokeWidth="2" />
        <rect x="412" y="330" width="70" height="66" rx="4" fill="#F7F3EC" stroke="#E4DACB" strokeWidth="2" />
        <rect x="490" y="330" width="70" height="66" rx="4" fill="#F7F3EC" stroke="#E4DACB" strokeWidth="2" />
        <rect x="468" y="356" width="8" height="14" rx="3" fill="#B8C1CB" />
        <rect x="496" y="356" width="8" height="14" rx="3" fill="#B8C1CB" />
        <rect x="394" y="304" width="184" height="16" rx="5" fill="#B98B5E" />
        <ellipse cx="486" cy="305" rx="54" ry="9" fill="#FFFFFF" stroke="#D8CEBF" strokeWidth="2" />
      </g>
      <g data-part="tap">
        <rect x="479" y="282" width="14" height="22" rx="4" fill="#C3CCD6" />
        <path d="M486 286v-14q0-12 12-12h8q10 0 10 10v6" fill="none" stroke="#C3CCD6" strokeWidth="7" strokeLinecap="round" />
        <rect data-part="tap-handle" x="470" y="266" width="20" height="6" rx="3" fill="#A9B4C0" />
      </g>
      <path data-part="drip" d="M516 286c-3 5-5 8-5 11a5 5 0 0 0 10 0c0-3-2-6-5-11z" fill="#3BA3D9" opacity="0" />
      <g data-part="check" transform="translate(548 262)">
        <circle r="15" fill="#0F7A4B" />
        <path d="M-7 0l5 5 9-10" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* CCTV camera in the top corner, with its scan beam */}
      <path data-part="scan" d="M566 94 452 230 530 250z" fill="url(#hs-scan)" />
      <g data-part="camera" style={{ transformOrigin: '604px 78px' }}>
        <rect x="600" y="60" width="8" height="20" rx="2" fill="#9AA5B1" />
        <rect x="556" y="74" width="52" height="24" rx="12" fill="#FFFFFF" stroke="#C9D2DB" strokeWidth="2" />
        <circle cx="567" cy="86" r="8" fill="#0B2545" />
        <circle cx="565" cy="84" r="2.2" fill="#FFFFFF" opacity="0.8" />
        <circle data-part="camera-led" cx="598" cy="82" r="3" fill="#E5484D" />
      </g>

      {/* toolbox, set down on the floor */}
      <g data-part="toolbox">
        <path d="M168 404v-12h30v12" fill="none" stroke="#0B2545" strokeWidth="5" strokeLinejoin="round" />
        <rect x="150" y="404" width="66" height="38" rx="6" fill="#F28C28" />
        <rect x="150" y="404" width="66" height="11" rx="5" fill="#D9761A" />
        <rect x="178" y="412" width="10" height="8" rx="2" fill="#0B2545" />
      </g>

      {/* technician: navy uniform, orange accents, small RHS patch */}
      <ellipse cx="252" cy="444" rx="46" ry="6" fill="#000000" opacity="0.08" />
      <g data-part="technician">
        <g data-part="leg-back">
          <rect x="257" y="360" width="19" height="78" rx="7" fill="#13315C" />
          <rect x="255" y="430" width="26" height="12" rx="5" fill="#1F2937" />
        </g>
        <g data-part="arm-back">
          <rect x="207" y="290" width="17" height="70" rx="8.5" fill="#13315C" />
          <circle cx="215.5" cy="362" r="8" fill="#C98E6B" />
        </g>
        <g data-part="leg-front">
          <rect x="227" y="360" width="19" height="78" rx="7" fill="#0B2545" />
          <rect x="221" y="430" width="26" height="12" rx="5" fill="#1F2937" />
        </g>
        <g data-part="torso">
          <rect x={TORSO.x} y={TORSO.y} width={TORSO.width} height={TORSO.height} rx="17" fill="#0B2545" />
          <path d="M240 280l10 14 10-14" fill="#13315C" />
          <rect x={TORSO.x} y={STRIPE.y} width={TORSO.width} height={STRIPE.height} fill="#F28C28" />
          <rect x={HEM.x} y={HEM.y} width={HEM.width} height={HEM.height} fill="#071A33" />
          {/* Chest print: the real RHS mark (reversed: white R and S, orange house and wrench), its own group for Phase 4. */}
          <g data-part="chest-logo" transform={chestLogo.transform}>
            {Object.entries(rhsMarkReversed).map(([name, p]) => (
              <path key={name} data-part={`logo-${name}`} d={p.d} fill={p.fill} fillRule={p.evenOdd ? 'evenodd' : undefined} />
            ))}
          </g>
        </g>
        <g data-part="head">
          <rect x="243" y="264" width="14" height="18" rx="5" fill="#B87B59" />
          <circle cx="250" cy="250" r="22" fill="#C98E6B" />
          <circle cx="231" cy="252" r="4.5" fill="#B87B59" />
          <path d="M228 248a22 22 0 0 1 44 0z" fill="#0B2545" />
          <path d="M262 246h18a4 4 0 0 1 0 7h-18z" fill="#F28C28" />
          <circle cx="262" cy="256" r="2" fill="#2B1D16" />
        </g>
        <g data-part="arm-front">
          <path d="M280 298l20 30 6-36" fill="none" stroke="#0B2545" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="296" y="300" width="17" height="5" rx="2.5" fill="#F28C28" transform="rotate(-80 304 302)" />
          <circle cx="306" cy="284" r="9" fill="#C98E6B" />
          <rect x="302" y="266" width="7" height="14" rx="3.5" fill="#C98E6B" />
        </g>
      </g>
    </svg>
  )
}
