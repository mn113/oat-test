/* global $ */

var MyApp = (function($) {
    var apiBaseUrl = "https://hr.oat.taocloud.org/v1";
    var users = [];

    // Init function:
    (function() {
        // Wire up behaviours:
        // Show/hide extended details on h3 click:
        $("#takers").on("click", "h3", function(evt) {
            $(this).siblings(".details").toggle();
        })
    })();

    // Using AJAX, fetch all users from the API:
    function getUsers(name = "", limit = 20, offset = 0) {
        $.ajax({
            type: 'GET',
            url: `${apiBaseUrl}/users?name=${name}&limit=3&offset=${offset}`,   // FIXME:
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
                renderUsers("#takers");
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
                data.userId = parseInt(data.userId, 10);
                // Add the data to local data:
                var index = users.findIndex(user => user.userId == data.userId);
                // If it exists, overwrite:
                if (index > -1) {
                    users[index] = data;
                }
                // If it's new, add it:
                else {
                    users.push(data);
                }
                // Render the user's extended details:
                renderUser(data);
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
        users.forEach(function(user) {
            renderUser(user, target);
        });
    }

    function renderUser(userObj, target) {
        console.log("Rendering user:", userObj);

        // Find specific user <li> so we can update it:
        var li = $(`li#user${userObj.userId}`);

        var html = `<li id="user${userObj.userId}">
            <h3>${userObj.firstName} ${userObj.lastName}</h3>`;
        // If user data is extended, render that info in a container:
        // Sensitive data should not be rendered
        if (undefined !== userObj.login) {
            html += `<div class="details">
                <p><label>Title:</label> ${userObj.title}</p>
                <p><label>Address:</label> ${userObj.address}</p>
                <p><label>Email:</label> ${userObj.email}</p>
                <p><label>Gender:</label> ${userObj.gender}</p>
                <p><label>Login:</label> ${userObj.login}</p>
            </div>`;
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