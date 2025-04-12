
//server shut down icon used in the medical document service
const ServerShutdownIcon = () => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width="70%"
    height="70%"
    fill="none"
  >
    {/* Server body */}
    <rect x="12" y="8" width="40" height="16" rx="2" ry="2" fill="#000" />
    <rect x="12" y="24" width="40" height="16" rx="2" ry="2" fill="#000" />
    <rect x="12" y="40" width="40" height="16" rx="2" ry="2" fill="#000" />
    {/* Indicators */}
    <circle cx="16" cy="16" r="2" fill="#FFF" />
    <circle cx="16" cy="32" r="2" fill="#FFF" />
    <circle cx="16" cy="48" r="2" fill="#FFF" />
    {/* X Symbol */}
    <g transform="translate(44, 44)">
      <circle cx="8" cy="8" r="8" fill="#000" />
      <line
        x1="4"
        y1="4"
        x2="12"
        y2="12"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="4"
        x2="4"
        y2="12"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  </svg>
  );
  
  export default ServerShutdownIcon;