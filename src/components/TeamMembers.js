import teamData from '../data/teamData.json';

// Import all team member images
const importTeamImages = () => {
  const teamMembers = teamData.map(member => {
    try {
      // Create a relative path to the image in the assets directory
      const imagePath = require(`../assets/${member.image}`);
      
      return {
        ...member,
        image: imagePath
      };
    } catch (error) {
      console.error(`Error loading image for team member ${member.name}:`, error);
      // Return the member with a placeholder or default image if the image fails to load
      return {
        ...member,
        image: require('../assets/profile-placeholder.js').profilePlaceholder
      };
    }
  });

  return teamMembers;
};

const teamMembers = importTeamImages();

export default teamMembers;
