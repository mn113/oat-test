/* global $ */

var MyApp = (function($) {
    var apiBaseUrl = "https://hr.oat.taocloud.org/v1";
    var users = [];
    var defaultTarget = "#takers";

    // Init function:
    // Wire up behaviours:
    (function() {
        // Show/hide extended details on h3 click:
        $("#takers").on("click", "h3", function(evt) {
            $(this).closest("li").toggleClass("open");
        });

        // Fetcher link:
        $("#fetcher").on("click", function(evt) {
            $(this).prop("disabled", true);
            getUsers();
        });

        // Individual fetcher icons:
        $("#takers").on("click", ".refresher", function(evt) {
            evt.preventDefault();
            // Extract user's id from the <li> above:
            var userIdString = $(this).closest("li").attr("id");
            var userId = parseInt(userIdString.substring(4), 10);
            getUserById(userId);
        });
    })();

    // Using AJAX, fetch all users from the API:
    // TODO: implement extra params
    function getUsers(name = "", limit = 20, offset = 0) {
        console.log("Function context", this);
        $.ajax({
            type: 'GET',
            url: `${apiBaseUrl}/users?name=${name}&limit=${limit}&offset=${offset}`,
            dataType: 'json',
            timeout: 750,
            triesLeft: 5,
            success: function(data){
                console.log("Received", data.length, "users");
                // Store them locally:
                users = data;
                // Fetch the individual users' details:
                users.forEach(function(user) {
                    getUserById(user.userId);
                });
                // Render all the users:
                renderUsers();
                // Re-enable button:
                $("#fetcher").prop("disabled", false);
            },
            error: function(xhr, textStatus, errorThrown) {
                if (textStatus == 'timeout') {
                    console.error('Ajax timeout!');
                    // Try again, up to 5 times:
                    this.triesLeft--;
                    if (this.triesLeft > 0) {
                        console.log('Trying again...', this.triesLeft);
                        $.ajax(this);
                    }
                }
                else {
                    console.error(errorThrown);
                }
            }
        });
    }

    // Fetch a single user by his ID:
    function getUserById(userId) {
        $.ajax({
            type: 'GET',
            url: `${apiBaseUrl}/user/${userId}`,
            dataType: 'json',
            timeout: 750,
            success: function(data){
                console.log("Received user:", data);
                data.userId = parseInt(data.userId, 10);
                // Add the data to local data:
                var index = users.findIndex(user => user.userId == data.userId);
                // If userId exists, overwrite data:
                if (index > -1) {
                    users[index] = data;
                }
                // If it's new, add it:
                else {
                    users.push(data);
                }
                // Render this user's extended details:
                renderUser(data);
            },
            error: function(xhr, type) {
                console.error('Ajax error! Could not retrieve user', userId);
            }
        });
    };

    // Render all the users we know, overwriting previous content:
    function renderUsers(target = defaultTarget) {
        // Clear destination element:
        $(target).html();

        if (users.length === 0) {
            $(target).html("<p>No users found.</p>");
        }
        else {
            users.forEach(function(user) {
                renderUser(user, target);
            });
        }
    }

    // Render a single user:
    function renderUser(userObj, target = defaultTarget) {
        console.log("Rendering user:", userObj);

        // Find specific user <li> so we can update it:
        var li = $(`li#user${userObj.userId}`);

        var html = `<li class="row" id="user${userObj.userId}">
            <h3>${userObj.firstName} ${userObj.lastName}
                <span>userId: ${userObj.userId}</span>
                <a href="#" class="refresher">Refresh</a>            
            </h3>`;
        
        // If user data is extended, render that info in a container:
        // Sensitive data should not be rendered
        if (undefined !== userObj.login) {
            html += `<div class="details">`;
            if (userObj.picture) {
                html += `<img src="${userObj.picture}">`;
            }
            // Loop through properties:
            for (var key of Object.keys(userObj)) {
                if (key !== 'password' && key !== 'picture') {
                    html += `<p><label>${key}:</label> ${userObj[key]}</p>`;
                }
            }
            html += '</div>';
        }
        html += '</li>';

        // Replace existing <li> or append new one:
        if (li.length > 0) {
            li.first().replaceWith(html)
        }
        else {
            $(target).append(html);
        }
    }

    // Reveal the module's methods:
    return {
        users: users,
        getUsers: getUsers,
        getUserById: getUserById,
        renderUsers: renderUsers,
        renderUser: renderUser
    };

}($));

// On document ready:
$(function() {
    MyApp.getUsers();
});