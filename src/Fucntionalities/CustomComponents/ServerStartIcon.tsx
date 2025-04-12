//server start icon used in medical document service
const ServerStartIcon = () => (
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
    {/* Upward Arrow */}
    <g transform="translate(44, 44)">
      <circle cx="8" cy="8" r="8" fill="#000" />
      <polygon
        points="8,3 12,8 10,8 10,13 6,13 6,8 4,8"
        fill="#FFF"
      />
    </g>
  </svg>
  );
  
  export default ServerStartIcon;
  