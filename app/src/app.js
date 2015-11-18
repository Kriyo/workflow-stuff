(function() {
    'use strict';
    angular.module('app',
        [ 'ngMaterial'
        , 'app.controllers'
        , 'app.services'
        , 'ui.router'
        , 'md.data.table'
        , 'angularBasicAuth'])
        .constant('env', 'production')
        .constant('defaultEndopoint', 'http://192.168.130.45:8080/ghibli-workflow/resources')
        .constant('endpoints', [{
            "name": "development",
            "url": "http://192.168.200.105:8080/ghibli-workflow/resources"
        }, {
            "name": "production",
            "url": "/ghibli-workflow/resources"
        }])
        .run(['$rootScope', '$state', '$location', '$log', 'ghibliWorkflowService', function($rootScope, $state, $location, $log, ghibliWorkflowService) {

          // get the passticket

          // validate it


        }])
        .config(function($mdThemingProvider, $mdIconProvider) {

            $mdIconProvider
                .defaultIconSet("./assets/svg/avatars.svg", 128)
                .icon("menu", "./assets/svg/menu.svg", 24)
                .icon("share", "./assets/svg/share.svg", 24)
                .icon("google_plus", "./assets/svg/google_plus.svg", 512)
                .icon("hangouts", "./assets/svg/hangouts.svg", 512)
                .icon("twitter", "./assets/svg/twitter.svg", 512)
                .icon("phone", "./assets/svg/phone.svg", 512);

            $mdThemingProvider.theme("success-toast");
            $mdThemingProvider.theme("fail-toast");

            $mdThemingProvider.theme('default')
                .primaryPalette('teal')
                .accentPalette('grey');

        })
        .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/rules");

            $stateProvider
                .state('main', {
                    url: "/main",
                    templateUrl: "partials/main.html"
                })
                .state('rule', {
                    url: "/rule/:id",
                    templateUrl: "partials/rule.html"
                })
                .state('rules', {
                    url: "/rules",
                    templateUrl: "partials/rules.html"
                })
                .state('test', {
                    url: "/test",
                    templateUrl: "partials/test-rest.html"
                })
                .state('login', {
                    url: "/login",
                    templateUrl: "partials/login.html"
                })
        }])
        .config(['$provide', '$httpProvider', function($provide, $httpProvider) {
            // $httpProvider.defaults.headers.get = { 'My-Header' : 'value' };
            // $httpProvider.defaults.headers.common['Accept'] = 'application/json';
            // $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
            // Intercept http calls.
            $provide.factory('CustomHttpInterceptor', ['$q', '$rootScope', '$log', function($q, $rootScope, $log) {
                return {
                    // On request success
                    request: function(config) {
                        $log.debug("CustomHttpInterceptor - request", config); // Contains the data about the request before it is sent.
                        $rootScope.loadingInProgress = true;
                        // Return the config or wrap it in a promise if blank.
                        return config || $q.when(config);
                    },
                    // On request failure
                    requestError: function(rejection) {
                        $log.error("CustomHttpInterceptor - requestError", rejection); // Contains the data about the error on the request.
                        $rootScope.loadingInProgress = false;
                        // Return the promise rejection.
                        return $q.reject(rejection);
                    },
                    // On response success
                    response: function(response) {
                        $log.debug("CustomHttpInterceptor - response", response); // Contains the data from the response.
                        $rootScope.loadingInProgress = false;
                        // Return the response or promise.
                        return response || $q.when(response);
                    },
                    // On response failture
                    responseError: function(rejection) {
                        $log.error("CustomHttpInterceptor - responseError", rejection); // Contains the data about the error.
                        $rootScope.loadingInProgress = false;
                        // Return the promise rejection.
                        return $q.reject(rejection);
                    }
                };
            }]);

            // Add the interceptor to the $httpProvider.
            $httpProvider.interceptors.push('CustomHttpInterceptor');

        }]);
})();
