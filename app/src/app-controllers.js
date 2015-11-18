(function() {
    'use strict';
    angular.module('app.controllers', ['ngMaterial', 'app.services', 'angular-cron-jobs'])
        .controller('AppController', [
            'ghibliWorkflowService', '$log', '$location', '$rootScope', '$mdDialog','$state', '$mdToast',
            function(ghibliWorkflowService, $log, $location, $rootScope, $mdDialog, $state, $mdToast) {
                var self = this;
                self.title = "GHIBLI WorkFlow UI PoC";

                self.navigateTo = function(path) {
                    $location.path(path);
                }

                self.logout = function() {
                    $log.info("logout!");
                    ghibliWorkflowService.setUserLoggedIn(undefined);
                    $mdToast.show(
                        $mdToast.simple()
                        .content("Good Bye " + self.user + " !")
                        .position("top left")
                        .hideDelay(3000)
                    );
                    $location.path("/login");
                }

                // self.user = ghibliWorkflowService.getUserLoggedIn();

                $rootScope.$on('showSimpleToast', function(event, message) {
                    $mdToast.show(
                        $mdToast.simple()
                        .content(message)
                        .position("botton left")
                        .hideDelay(3000)
                    );
                });

                $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
                    var from = fromState.name ? fromState.name : "<none>";
                    $log.info("from state: " + from + " to " + toState.name);

                    self.user = ghibliWorkflowService.getUserLoggedIn();

                    if (toState.name == "login") {
                        return;
                    }

                    if (self.user) {
                        $log.info("user " + self.user + " logged in ---> ok!");
                        return;
                    } else if (toState.name == "login") {
                        return;
                    } else {
                        $log.info("user not logged in ---> redirect to login page");
                        event.preventDefault();
                        $state.go('login');
                        ghibliWorkflowService.setRedirectAfterLogin(toState, toParams);
                        return;
                    }
                });

                self.openJSONDebugModal = function(ev, jsonData) {
                    $mdDialog.show({
                        controller: function($scope) {
                            $scope.data = jsonData;
                        },
                        template: '<md-content flex><md-content flex><pre flex>{{data | json}}</pre></md-content></md-content>',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true
                    });
                }

            }
        ])
        .controller('ruleController', ['ghibliWorkflowService', '$log', '$location', '$mdToast', '$stateParams', '$mdDialog', function(ghibliWorkflowService, $log, $location, $mdToast, $stateParams, $mdDialog) {
            var self = this;

            var id = $stateParams.id;

            self.reset = function() {
                self.init();
            }

            self.init = function() {
                self.data = {
                    "enabled": false
                }

                self.getAllRuleTypes();

                self.getAllDestinationDispositionTypes();

                self.getAllPreProcessOperationTypes();

                self.getAllRemotePullDispositionTypes();

                self.getAllProtocols();

                self.getClusterInfo();
            }


            if (id > 0) {
                ghibliWorkflowService
                    .getRouteById(id, 'COMMON')
                    .then(function(response) {
                        self.data = response.data;
                        // ghibliWorkflowService
                        //     .getRouteById(id, self.data.ruleType)
                        //     .then(function(response) {
                        //         self.data = response.data;

                        //     });
                    });
            }

            self.getAllRuleTypes = function() {
                ghibliWorkflowService
                    .getAllRuleTypes()
                    .then(function(response) {
                        self.ruleTypes = [].concat(response);
                    });
            }

            self.getAllDestinationDispositionTypes = function() {
                ghibliWorkflowService
                    .getAllDestinationDispositionTypes()
                    .then(function(response) {
                        self.destinationDispositionTypes = [].concat(response);
                    });
            }

            self.getAllPreProcessOperationTypes = function() {
                ghibliWorkflowService
                    .getAllPreProcessOperationTypes()
                    .then(function(response) {
                        self.preProcessOperationTypes = [].concat(response);
                    });
            }

            self.getAllRemotePullDispositionTypes = function() {
                ghibliWorkflowService
                    .getAllRemotePullDispositionTypes()
                    .then(function(response) {
                        self.remotePullDispositionTypes = [].concat(response);
                    });
            }

            self.getClusterInfo = function() {
                ghibliWorkflowService
                    .getClusterInfo()
                    .then(function(response) {
                        self.clusterInformation = [].concat(response);
                    });
            }


            self.getAllProtocols = function() {
                ghibliWorkflowService
                    .getAllProtocols()
                    .then(function(response) {
                        self.protocols = [].concat(response);
                    });
            }

            self.isSectionVisible = function(section, ruleType) {
                if (!ruleType) {
                    return false;
                }
                if (ruleType == "STATIC_ROUTING") {
                    switch (section) {
                        case "source":
                            return true;
                        case "pre-process-op":
                            return true;
                        case "destination":
                            return true;
                        case "destination-disposition":
                            return true;
                        default:
                            return false;
                    }
                }

                if (ruleType == "REMOTE_POLLING_ROUTING") {
                    switch (section) {
                        case "source":
                            return true;
                        case "pre-process-op":
                            return false;
                        case "destination":
                            return true;
                        case "destination-disposition":
                            return true;
                        default:
                            return false;
                    }
                }

                return false;
            }

            self.isSourceSectionVisible = function(section, ruleType) {
                if (!ruleType) {
                    return false;
                }
                if (ruleType == "STATIC_ROUTING") {
                    switch (section) {
                        case "incoming-cluster":
                            return true;
                        case "remote-path":
                            return false;
                        case "incoming-stuff":
                            return false;
                        case "file-pattern":
                            return true;
                        default:
                            return false;
                    }
                }

                if (ruleType == "REMOTE_POLLING_ROUTING") {
                    switch (section) {
                        case "incoming-cluster":
                            return false;
                        case "remote-path":
                            return true;
                        case "incoming-stuff":
                            return true;
                        case "file-pattern":
                            return false;
                        default:
                            return false;
                    }
                }

                return false;
            }

            self.saveNewRule = function(rule) {
                ghibliWorkflowService
                    .saveRule(rule)
                    .then(function(response) {
                        $mdToast.show(
                            $mdToast.simple()
                            .content('Rule ' + rule.name + ' saved!')
                            .position("top right")
                            .hideDelay(3000)
                        );
                        $location.path("/rules");
                    });
            }

            self.validate = function(rule) {
                return rule.ruleType && rule.name && rule.description;
            }

            self.openCronJobEditor = function(ev, rule) {
                $mdDialog.show({
                    controller: function($scope, $mdDialog) {
                        $scope.ok = function(cronJobString) {
                            $mdDialog.hide(cronJobString);
                        }
                    },
                    templateUrl: 'partials/cron-job-editor.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false
                }).then(function(cronJobString) {
                    rule.remotePollingCronExpression = cronJobString;
                    $log.info("CronJobEditor - cronJob setted: " + rule.remotePollingCronExpression);
                }, function() {
                    // cancell dialog
                    rule.remotePollingCronExpression = undefined;
                });
            }

            self.init();

        }])

        .controller('rulesController', ['ghibliWorkflowService', '$log', '$q', '$timeout', '$location', '$mdDialog', '$mdToast', 'authDefaults',

         function(ghibliWorkflowService, $log, $q, $timeout, $location, $mdDialog, $mdToast, authDefaults) {

            var self = this;

            this.selected = [];

            this.reset = function() {
                this.query = {
                    search: undefined,
                    order: 'name',
                    limit: 15,
                    page: 1
                };
            }

            // load all the routes from the service
            this.loadAll = function() {
                self.reset();
                ghibliWorkflowService
                    .getAllRoutes()
                    .then(function(response) {
                        self.data = [].concat(response.data);
                    });
            }

            this.showDetails = function(id) {
                $location.path("/rule/" + id);
            }

            this.newRule = function() {
                $location.path("/rule/-1");
            }

            this.onpagechange = function(page, limit) {
                var deferred = $q.defer();

                $timeout(function() {
                    deferred.resolve();
                }, 2000);

                return deferred.promise;
            };

            this.onorderchange = function(order) {
                var deferred = $q.defer();

                $timeout(function() {
                    deferred.resolve();
                }, 2000);

                return deferred.promise;
            };

            this.toggleEnable = function(ev, rule, enabled) {
                ghibliWorkflowService
                    .toggleEnable(rule, enabled)
                    .then(function(response) {
                        $log.info("toggleEnable: ", response);
                    });
            }

            this.deleteRule = function(ev, rule) {
                var confirm = $mdDialog.confirm()
                    .title('Are you sure?')
                    .content('The rule ' + rule.name + " will be deleted..")
                    .ariaLabel('Are you sure?')
                    .targetEvent(ev)
                    .ok('Yes')
                    .cancel('No');
                $mdDialog.show(confirm).then(function() {
                    ghibliWorkflowService
                        .deleteRule(rule)
                        .then(function(response) {
                            $log.info("delete: ", response);
                            $mdToast.show(
                                $mdToast.simple()
                                .content('Rule ' + rule.name + ' cancelled!')
                                .position("top right")
                                .hideDelay(3000)
                            );
                            self.loadAll();
                        });
                }, function() {
                    $log.info("delete: cancelled!");
                });
            }

            self.loadAll();

            return this;
        }])

        .controller('loginController',
            [ 'authService'
            , 'authDefaults'
            , '$rootScope'
            , '$scope'
            , '$log'
            , 'ghibliWorkflowService'
            , '$q'
            , '$state'
            , '$mdToast'
            , '$location',
            function(authService, authDefaults, $rootScope, $scope, $log, ghibliWorkflowService,  $q, $state, $mdToast, $location) {
                var self = this;

                // Endpoints
                authService.addEndpoint();
                authService.addEndpoint('http://192.168.130.13:8080');

                authDefaults.authenticateUrl = '';

                $rootScope.$on('login', function() {
                    self.loggedInUsername = authService.username();
                });

                $rootScope.$on('logout', function() {
                    self.loggedInUsername = null;
                });

                self.onLoginButton = function () {
                    authService
                    .login(self.username, self.password)
                    .success(function() {

                        $mdToast.show(
                            $mdToast.simple()
                            .content('Welcome ' + self.username + ' !')
                            .position("top left")
                            .hideDelay(3000)
                        );

                        ghibliWorkflowService.setUserLoggedIn(self.username);

                        var redirect = ghibliWorkflowService.getRedirectAfterLogin();

                        if (!redirect || !redirect.toState.name) {
                            $log.info("default redirect to /rules");
                            $location.path("/rules");
                        } else {
                            $log.info("redirecting to " + redirect.toState.name);
                            // TODO fix me!
                            $state.go(redirect.toState.name, redirect.toParam);
                        }

                    })
                    .error(function() {
                        // Logging for this is handled within the Service
                        // authService logout method has been called to clear localStorage data

                        $mdToast.show(
                            $mdToast.simple()
                            .content('Authentication for ' + self.username + ' failed !')
                            .position("top left")
                            .hideDelay(3000)
                            .theme("fail-toast")
                        );
                    });
                };

                self.onLogoutButton = function () {
                    authService.logout();
                    $location.path("/login");
                };
            }
        ])

        .controller('testController', ['ghibliWorkflowService', '$log', '$q', function(ghibliWorkflowService, log, q) {
            var self = this;

            self.httpMethods = [{
                "name": "GET",
                "description": "GET"
            }, {
                "name": "POST",
                "description": "POST"
            }, {
                "name": "PUT",
                "description": "PUT"
            }, {
                "name": "DELETE",
                "description": "DELETE"
            }];

            self.httpMethod = "GET";
            self.service = "http://192.168.130.249:8080/ghibli-workflow/resources/routingRules";

            self.doCall = function(service, httpMethod, $log) {
                ghibliWorkflowService
                    .test(service, httpMethod).then(function(response) {
                        self.result = response.data;
                    });
                    $log.info("Initiated a " + httpMethod + " on " + service);
            };
            return this;

        }])
})();
