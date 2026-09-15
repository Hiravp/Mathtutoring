export function AetherSky({ compact = false }: { compact?: boolean }) {
  return <svg className="aether-art" viewBox="0 0 1000 520" role="img" aria-label="The Aether Isles, with floating crystals and a forest valley" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="sky" x2="0" y2="1"><stop stopColor="#8ce7ed"/><stop offset=".55" stopColor="#2d9caa"/><stop offset="1" stopColor="#15566f"/></linearGradient>
      <linearGradient id="mountain" x2="0" y2="1"><stop stopColor="#8de2cf"/><stop offset="1" stopColor="#287d76"/></linearGradient>
      <linearGradient id="island" x2="0" y2="1"><stop stopColor="#65d49e"/><stop offset="1" stopColor="#1e705e"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="1000" height="520" fill="url(#sky)"/>
    <g fill="#dff9ed" opacity=".65"><path d="M95 103c25-42 90-31 96 11 40-22 90 1 82 37H51c-5-27 15-48 44-48Z"/><path d="M720 75c18-34 70-31 84 5 35-13 71 8 68 39H671c0-25 19-44 49-44Z"/></g>
    <g fill="none" stroke="#b8f4e9" strokeWidth="3" opacity=".55"><path d="M90 190c130-68 219-60 332 6s201 62 371-7"/><path d="M430 45c30 40 45 85 31 141"/></g>
    <path d="M0 330 150 195l96 108 109-165 118 152 105-129 147 169 94-102 181 120v172H0Z" fill="url(#mountain)" opacity=".72"/>
    <path d="m0 356 125-91 73 75 98-126 73 112 129-104 89 122 94-68 103 79 111-99 105 119v164H0Z" fill="#1d5964" opacity=".68"/>
    <g filter="url(#glow)"><path d="M154 166 170 103l37 54-26 47Z" fill="#e0b4ff" stroke="#fff" strokeWidth="3"/><path d="m794 226 20-72 36 62-25 57Z" fill="#ffd978" stroke="#fff" strokeWidth="3"/><path d="m578 153 12-43 28 37-17 38Z" fill="#b5fff0" stroke="#fff" strokeWidth="2"/></g>
    <path d="M0 410c120-82 235-51 316-9 75 39 160 41 241-9 110-68 239-75 443 25v103H0Z" fill="url(#island)"/>
    <g fill="#0c4e4b"><path d="M70 432v-88l-20 20 20-48 22 48-17-20v88Z"/><path d="M260 443v-108l-24 21 24-61 27 61-22-21v108Z"/><path d="M876 448v-110l-23 22 23-59 25 59-20-22v110Z"/></g>
    <path d="M400 407h210l-18 39H417Z" fill="#e5a657" stroke="#653d54" strokeWidth="7"/><path d="M425 395v-86h150v86" fill="#f4c875" stroke="#653d54" strokeWidth="7"/><path d="m407 314 92-67 94 67Z" fill="#d85d75" stroke="#653d54" strokeWidth="7"/><circle cx="500" cy="344" r="12" fill="#6e486b"/><path d="M474 407v-39h52v39" fill="#734e72"/>
    {!compact && <g className="sparkles" fill="#fff9cf"><circle cx="330" cy="120" r="4"/><circle cx="670" cy="202" r="5"/><circle cx="910" cy="130" r="3"/><path d="m358 248 5 14 14 5-14 5-5 14-5-14-14-5 14-5Z"/><path d="m691 97 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z"/></g>}
  </svg>;
}

export function Mosswing({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'companion-svg small' : 'companion-svg'} viewBox="0 0 240 210" role="img" aria-label="Mosswing, a friendly teal winged companion">
    <defs><linearGradient id="moss" x2="0" y2="1"><stop stopColor="#7ce5ba"/><stop offset="1" stopColor="#257b72"/></linearGradient></defs>
    <ellipse cx="124" cy="184" rx="69" ry="12" fill="#153e55" opacity=".35"/><path d="M89 122c-34-6-55-34-56-63 28 0 59 14 75 37" fill="#45bfa8" stroke="#164f61" strokeWidth="7"/><path d="M151 122c34-6 55-34 56-63-28 0-59 14-75 37" fill="#45bfa8" stroke="#164f61" strokeWidth="7"/><path d="M77 79c-3-42 24-66 59-66s62 24 59 66l-13 77H88Z" fill="url(#moss)" stroke="#164f61" strokeWidth="7"/><path d="M101 43c15-17 38-18 55-1" fill="none" stroke="#b4f5c9" strokeWidth="8" strokeLinecap="round"/><circle cx="110" cy="87" r="9" fill="#fff"/><circle cx="152" cy="87" r="9" fill="#fff"/><circle cx="112" cy="89" r="4" fill="#173c57"/><circle cx="150" cy="89" r="4" fill="#173c57"/><path d="M117 116q18 17 36 0" fill="none" stroke="#164f61" strokeWidth="6" strokeLinecap="round"/><path d="m75 50-22-23m128 23 22-23" stroke="#f3cb68" strokeWidth="8" strokeLinecap="round"/><path d="M110 151q13 13 26 0" stroke="#d5ffcc" strokeWidth="7" fill="none" strokeLinecap="round"/>
  </svg>;
}

export function Guardian({ hp = 100 }: { hp?: number }) {
  const width = Math.max(0, Math.min(100, hp));
  return <div className="guardian-wrap"><svg viewBox="0 0 240 190" className="guardian-svg" role="img" aria-label="A gentle stone guardian"><path d="M40 178 53 65 91 39l58 0 38 26 13 113Z" fill="#796a86" stroke="#322f59" strokeWidth="8"/><path d="m73 59 20-39 18 24 25-34 19 49" fill="#a491b2" stroke="#322f59" strokeWidth="8"/><path d="M72 97q18-26 36 0m28 0q18-26 36 0" fill="none" stroke="#e7cdff" strokeWidth="11" strokeLinecap="round"/><path d="M108 130q13 11 26 0" fill="none" stroke="#322f59" strokeWidth="7" strokeLinecap="round"/><circle cx="88" cy="97" r="4" fill="#4434a5"/><circle cx="152" cy="97" r="4" fill="#4434a5"/></svg><div className="hp-track" aria-label={`Guardian health ${width} percent`}><span style={{ width: `${width}%` }}/></div></div>;
}
