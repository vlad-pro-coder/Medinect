//text copy icon used in medical document
const TextCopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width="70%"
    height="70%"
    fill="none"
  >
    {/* Back Page */}
    <rect
      x="14"
      y="6"
      width="32"
      height="44"
      rx="4"
      ry="4"
      fill="#CCC"
      stroke="#000"
      strokeWidth="2"
    />
    {/* Front Page */}
    <rect
      x="24"
      y="16"
      width="32"
      height="44"
      rx="4"
      ry="4"
      fill="#000"
      stroke="#000"
      strokeWidth="2"
    />
    {/* Writing Lines */}
    <line x1="30" y1="24" x2="50" y2="24" stroke="#FFF" strokeWidth="2" />
    <line x1="30" y1="32" x2="46" y2="32" stroke="#FFF" strokeWidth="2" />
    <line x1="30" y1="40" x2="50" y2="40" stroke="#FFF" strokeWidth="2" />
    <line x1="30" y1="48" x2="40" y2="48" stroke="#FFF" strokeWidth="2" />
  </svg>
);

export default TextCopyIcon;
