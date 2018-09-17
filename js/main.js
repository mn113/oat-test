/* global $ */

var MyApp = (function($) {
    var apiBaseUrl = "https://hr.oat.taocloud.org/v1";
    var users = [];

    // Init function:
    (function() {
        // Wire up behaviours:
    })();

    // Using AJAX, fetch all users from the API:
    function getUsers(name = "", limit = 20, offset = 0) {
        $.ajax({
            type: 'GET',
            url: `${apiBaseUrl}/users?name=${name}&limit=${limit}&offset=${offset}`,
            dataType: 'json',
            timeout: 750,
            success: function(data){
                console.log("Received", data.length, "users");
                // Store them locally:
                users = data;
                console.log("Users:", users);
                // Fetch the individual users' details:
                users.forEach(function(user) {
                    getUserById(user.userId);
                });
                // Render all the users
            },
            error: function(xhr, type) {
                console.error('Ajax error! Trying again in 5s...');
                setTimeout(function() {
                    getUsers();
                }, 5000);
            }
        })
    }

    function getUserById(userId) {
        $.ajax({
            type: 'GET',
            url: `${apiBaseUrl}/user/${userId}`,
            dataType: 'json',
            timeout: 750,
            success: function(data){
                console.log("Received", data);
                // Add the data to local data:
                var index = users.find(user => user.userId == data.userId);
                // If it exists, overwrite:
                if (index > -1) {
                    users[index] = data;
                }
                // If it's new, add it:
                else {
                    users.push(data);
                }
                // Render the user's details:
            },
            error: function(xhr, type) {
                console.error('Ajax error! Could not retrieve user', userId);
            }
        });
    };

    function renderUsers(target) {
        // Clear destination:
        $(target).html();

        if (users.length === 0) {
            $(target).html("No users found");
            return;
        }
        for (var user of users) {
            var userItem = new UserItem(user);
            $(target).append(userItem);
        }
    }

    function renderUser(userObj) {
        var html = `<li id="user${userObj.userId}">
            <h3>${userObj.firstName} ${userObj.lastName}</h3>`;
        if (userObj.details) {
            html += `<div class="details">
            
            </div>`;
        }
        html += '</li>';
        return html;
    }

    // Reveal the module's methods:
    return {
        users: users,
        getUserById: getUserById,
        getUsers: getUsers,
        renderUsers: renderUsers
    };

}($));

// On document ready:
$(function() {
    MyApp.getUsers();
});