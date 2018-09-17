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
                console.log(users);
                // Fetch the individual users' details:
                users.forEach(function(user) {
                    getUserById(user.userId);
                });
                // render the users
            },
            error: function(xhr, type){
                console.error('Ajax error! Trying again in 5s...');
                setTimeout(function() {
                    getUsers();
                }, 5000);
            }
        })
    }

    function getUserById(id) {
        console.log(id);
    }

    // Reveal the module's methods:
    return {
        users: users,
        getUserById: getUserById,
        getUsers: getUsers,
        //renderUsers: renderUsers
    };

}($));

// On document ready:
$(function() {
    MyApp.getUsers();
});