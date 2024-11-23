function userInformationHTML(user) {
    return `
    <h2>${user.name}
    <span class="small-name">
    (@<a href="${user.html_url}" target="_blank">${user.login}</a>)
    </span>
    </h2>
    <div class="gh-content">
    <div class="gh-avatar">  <!-- Fixed typo here -->
    <a href="${user.html_url}" target="_blank">
    <img src="${user.avatar_url}" width="80" height="80" alt="${user.login}">
    </a>
    </div>  <!-- Closing the div correctly -->
    <p>Followers: ${user.followers} - Following: ${user.following} <br> Repos: ${user.public_repos}</p>
    </div>`;
}


function repoInformationHTML(repos) {
    if (repos.length === 0) {
        return `<div class="clearfix repo-list">No repos!</div>`;
    }
    var listItemsHTML = repos.map(function (repo) {
        return `<li>
        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        </li>`
    });

    return `<div class="clearfix repo-list">
    <p>
    <strong>Repo List:</strong>
    </p>
    <ul>
    ${listItemsHTML.join("\n")}
    </ul>
    </div>`
}

function fetchGitHubInformation(event) {
    $("#gh-user-data").html("");
    $("#gh-repo-data").html("");

    var username = $("#gh-username").val();
    if (!username) {
        $("#gh-user-data").html(`<h2>Please enter a Github username</h2>`);
        return;
    }
    $("#gh-user-data").html(
        `<div id="loader">
        <img src ="assets/css/loader.gif" alt="loading..." />
        </div>`);
    $.when(
        $.getJSON(`https://api.github.com/users/${username}`),
        $.getJSON(`https://api.github.com/users/${username}/repos`)
    ).then(
        function (firstResponse, secondResponse) {
            var userData = firstResponse[0];
            var repoData = secondResponse[0];
            $("#gh-user-data").html(userInformationHTML(userData));
            $("#gh-repo-data").html(repoInformationHTML(repoData));
        }, function (errorResponse) {
            if (errorResponse.status === 404) {
                $("#gh-user-data").html(`<h2>No info found for user ${username}</h2>`);
            } else {
                console.log(errorResponse);
                // Accessing response JSON and proper error message
                var message = errorResponse.responseJSON ? errorResponse.responseJSON.message : 'An error occurred';
            
                // Check if rate limit exceeded and access the X-RateLimit-Reset header
                if (errorResponse.status === 403 && errorResponse.getResponseHeader('X-RateLimit-Reset')) {
                    var resetTime = errorResponse.getResponseHeader('X-RateLimit-Reset');
                    var resetDate = new Date(resetTime * 1000); // Convert to a human-readable date
                    var formattedTime = resetDate.toLocaleString(); // Format the time for display
            
                    // Custom message with reset time
                    message = `Too many requests, please wait until ${formattedTime}`;
                }
            
                $("#gh-user-data").html(
                    `<h2>Error: ${message}</h2>`
                );
            }
        });
}

$(document).ready(fetchGitHubInformation);