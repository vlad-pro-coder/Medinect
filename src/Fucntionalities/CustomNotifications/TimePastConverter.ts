
function timeSince(dateString:string) {
  //calculates the time it has passed since "dataString" used for notifications
    const now = new Date();
    const past = new Date(dateString);

    const diffInMilliseconds: number = now.getTime() - past.getTime();

    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  
    // Calculate time differences
    const years = Math.floor(diffInSeconds / (365 * 24 * 60 * 60));
    const months = Math.floor(diffInSeconds / (30 * 24 * 60 * 60));
    const days = Math.floor(diffInSeconds / (24 * 60 * 60));
    const hours = Math.floor(diffInSeconds / (60 * 60));
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds;
  
    // Return the appropriate unit
    //just an approximate not the entire time
    if (minutes === 0) {
      return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    } else if (hours === 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (days === 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (months === 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (years === 0) {
      return `${months} month${months === 1 ? '' : 's'} ago`;
    } else {
      return `${years} year${years === 1 ? '' : 's'} ago`;
    }
  }

  export default timeSince