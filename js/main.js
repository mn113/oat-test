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
    // TODO: implement extra params
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
                // Fetch the individual users' details:
                users.forEach(function(user) {
                    getUserById(user.userId);
                });
                // Render all the users:
                renderUsers("#takers");
            },
            error: function(xhr, type) {
                console.error('Ajax error! Trying again in 5s...');
                setTimeout(function() {
                    getUsers();
                }, 5000);
                // TODO: check if this is a good practice...
            }
        })
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
                renderUser(data, "#takers");
            },
            error: function(xhr, type) {
                console.error('Ajax error! Could not retrieve user', userId);
            }
        });
    };

    // Render all the users we know, overwriting previous content:
    function renderUsers(target) {
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