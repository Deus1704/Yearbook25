// Import simpler named images to avoid path issues
import ghibli1 from './ghibli_images/09F156D1-BCB5-4805-B281-6C0493F407A6.PNG';
import ghibli2 from './ghibli_images/1CF68C2F-B758-4218-83F3-CDB7E137DE75.PNG';
import ghibli3 from './ghibli_images/3842E73A-FFC8-4EA1-906D-D55C5BBD7CC6.PNG';
import ghibli4 from './ghibli_images/4466A841-4A29-4B28-BD28-F7A627F69158.PNG';
import ghibli5 from './ghibli_images/70BC3660-C792-4E0E-8A0B-5A4E66944BEB.PNG';
import ghibli6 from './ghibli_images/76DD55E1-0F17-4831-89A5-F010337E1F26.PNG';
import ghibli7 from './ghibli_images/83B3D36D-7ABC-4D06-8B16-7A15763ADAB5.PNG';
import ghibli8 from './ghibli_images/8D49246F-EF75-461B-A8EC-9EF5F656121B.PNG';
import ghibli9 from './ghibli_images/AA794F26-0453-442A-A112-FF603EFAEA26.PNG';
import ghibli10 from './ghibli_images/C4F20335-1EF6-4337-BCFC-20430ED94045.PNG';

// Create an array of all Ghibli images
const ghibliImages = [
  ghibli1, ghibli2, ghibli3, ghibli4, ghibli5,
  ghibli6, ghibli7, ghibli8, ghibli9, ghibli10
];

// Helper function to get a random Ghibli image
export const getRandomGhibliImage = () => {
  const randomIndex = Math.floor(Math.random() * ghibliImages.length);
  return ghibliImages[randomIndex];
};

export default ghibliImages;
