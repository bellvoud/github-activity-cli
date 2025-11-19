#!/usr/bin/env node

async function fetchGitHubActivity(username) {
  const response = await fetch(
    `https://api.github.com/users/${username}/events`,
    {
      headers: {
        "User-Agent": "node.js",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("User not found. Please check the username.");
    } else {
      throw new Error(`Error fetching data: ${response.status}`);
    }
  }

  return response.json();
}

// Display activity
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
        const commitCount = event.payload.size || 
                           (event.payload.commits && event.payload.commits.length) || 
                           event.payload.distinct_size || 
                           0;
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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const username = process.argv[2];

if (!username) {
  console.error('Usage: github-activity <username>');
  process.exit(1);
}

fetchGitHubActivity(username)
  .then((events) => {
    displayActivity(events);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });