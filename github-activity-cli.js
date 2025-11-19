#!/usr/bin/env node

const https = require('https');

const username = process.argv[2];

if (!username) {
  console.error('Usage: node github-activity.js <username>');
  process.exit(1);
}

function fetchGitHubActivity(username) {
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
        displayActivity(events);
      } catch (error) {
        console.error('Error parsing response:', error.message);
        process.exit(1);
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching data:', error.message);
    process.exit(1);
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
        const commitCount = event.payload.commits ? event.payload.commits.length : event.payload.size || 0;
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

fetchGitHubActivity(username);