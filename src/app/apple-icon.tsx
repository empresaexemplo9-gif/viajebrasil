import { ImageResponse } from 'next/og';

// iOS usa um PNG quadrado para o ícone da tela inicial (arredonda sozinho).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
        }}
      >
        {/* Símbolo "D" da marca DRAP, em tinta */}
        <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(1.3,15.6)">
            <path
              d="M 65.409444,6.6238851 39.434802,62.874198 h 22.174874 c 8.607065,0 15.537036,-9.612729 15.537036,-21.552689 V 27.53217 c 0,-10.120369 -4.978535,-18.5684503 -11.737268,-20.9082849 z"
              fill="#0B1018"
            />
            <path
              d="m 20.363098,5.9799967 c -0.0766,18.9658603 -0.05366,37.9282243 0,56.8942013 H 39.153682 L 62.755859,6.0373576 c -0.378431,-0.037937 -0.760546,-0.057361 -1.146183,-0.057361 z"
              fill="#0B1018"
            />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
