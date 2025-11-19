const https = require('https');

const username = process.argv[2];

if (!username) {
  console.error('Usage: github-activity <username>');
  process.exit(1);
}

async function fetchGitHubActivity(username) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}/events`,
      method: 'GET',
      headers: {
        'User-Agent': 'GitHub-Activity-CLI'
      }
    };

    https.get(options, (res) => {
      let data = '';

      // Handle rate limiting or errors
      if (res.statusCode === 404) {
        console.error(`Error: User '${username}' not found`);
        process.exit(1);
      } else if (res.statusCode === 403) {
        console.error('Error: API rate limit exceeded');
        process.exit(1);
      } else if (res.statusCode !== 200) {
        console.error(`Error: HTTP ${res.statusCode}`);
        process.exit(1);
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const events = JSON.parse(data);
          resolve(events);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Display
function displayActivity(events) {
  if (events.length === 0) {
    console.log('No recent activity found.');
    return;
  }

  console.log('Output:');
  
  events.forEach((event) => {
    let output = '';
    
    switch (event.type) {
      case 'PushEvent':
        const commitCount = event.payload.size || 0;
        output = `- Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${event.repo.name}`;
        break;
        
      case 'IssuesEvent':
        output = `- ${capitalize(event.payload.action)} an issue in ${event.repo.name}`;
        break;
        
      case 'WatchEvent':
        output = `- Starred ${event.repo.name}`;
        break;
        
      case 'ForkEvent':
        output = `- Forked ${event.repo.name}`;
        break;
        
      case 'CreateEvent':
        if (event.payload.ref_type === 'repository') {
          output = `- Created repository ${event.repo.name}`;
        } else if (event.payload.ref_type === 'branch') {
          output = `- Created branch ${event.payload.ref} in ${event.repo.name}`;
        }
        break;
        
      case 'PullRequestEvent':
        output = `- ${capitalize(event.payload.action)} a pull request in ${event.repo.name}`;
        break;
        
      case 'DeleteEvent':
        output = `- Deleted ${event.payload.ref_type} in ${event.repo.name}`;
        break;
        
      default:
        output = `- ${event.type.replace('Event', '')} in ${event.repo.name}`;
    }
    
    if (output) {
      console.log(output);
    }
  });
}

// Helper function to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

(async () => {
  try {
    const events = await fetchGitHubActivity(username);
    displayActivity(events);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();