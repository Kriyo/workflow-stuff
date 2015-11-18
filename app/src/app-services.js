(function() {
    'use strict';
    angular.module('app.services', ['ngMaterial', 'app'])
        .factory('ghibliWorkflowService', ['$q', '$http', 'env', 'endpoints', 'defaultEndopoint', '$log',
        function($q, $http, env, endpoints, defaultEndopoint, $log) {

            var endpoint = defaultEndopoint;

            for (var index in endpoints) {
                var name = endpoints[index].name;
                if (name == env) {
                    endpoint = endpoints[index].url;
                    break;
                }
            }

            var ruleTypes = [{
                name: "STATIC_ROUTING",
                description: "STATIC_ROUTING"
            }];
            // temporary hidden
            // , {
            //     name: "REMOTE_POLLING_ROUTING",
            //     description: "REMOTE_POLLING_ROUTING"
            // }];
            var clusterInformation = [{
              name: undefined,
              peers: undefined
            }]

            var destinationDispositionTypes = [{
                name: undefined,
                description: "NONE"
            }, {
                name: "DELETE",
                description: "DELETE"
            }];

            var preProcessOperationTypes = [{
                name: undefined,
                description: "NONE"
            }, {
                name: "RENAME",
                description: "RENAME"
            }];

            var remotePullDispositionTypes = [{
                name: undefined,
                description: "NONE"
            }, {
                name: "DELETE",
                description: "DELETE"
            }];

            var protocols = [{
                name: undefined,
                description: "NONE"
            }, {
                name: "HTTP",
                description: "HTTP"
            }, {
                name: "HTTPS",
                description: "HTTPS"
            }, {
                name: "FTP",
                description: "FTP"
            }, {
                name: "SFTP",
                description: "SFTP"
            }, {
                name: "FTPS",
                description: "FTPS"
            }, {
                name: "PR4",
                description: "PR4"
            }, {
                name: "PR5",
                description: "PR5"
            }];

            var user = undefined;
            var redirect = undefined;

            // Promise-based API
            return {
                test: function(service, httpMethod) {
                    return $http({
                        url: service,
                        method: httpMethod
                    });
                },
                getAllRoutes: function() {
                    var service = endpoint + "/routingRules";
                    return $http({
                        url: service,
                        method: "GET"
                    });
                },
                getRouteById: function(id, ruleType) {
                    var service = endpoint + "/routingRules/";
                    if (ruleType == 'STATIC_ROUTING') {
                        service += "/staticRoutingRules/";
                    } else if (ruleType == 'REMOTE_POLLING_ROUTING') {
                        service += "/remotePollingRoutingRules/";
                    }
                    return $http({
                        url: service + id,
                        method: "GET"
                    });
                },
                saveRule: function(rule) {
                    var ruleType = rule.ruleType;
                    var service = endpoint;
                    if (ruleType == 'STATIC_ROUTING') {
                        service += "/staticRoutingRules";
                    } else if (ruleType == 'REMOTE_POLLING_ROUTING') {
                        service += "/remotePollingRoutingRules";
                    }
                    return $http({
                        url: service,
                        data: rule,
                        method: "POST"
                    });
                },
                toggleEnable: function(rule, enabled) {
                    var id = rule.id || -1;
                    var action = enabled ? 'enable' : 'disable';
                    var service = endpoint + "/routingRules/" + id + "/" + action;
                    return $http({
                        url: service,
                        method: "POST"
                    });
                },
                deleteRule: function(rule) {
                    var id = rule.id || -1;
                    var service = endpoint + "/routingRules/" + id;
                    return $http({
                        url: service,
                        method: "DELETE"
                    });
                },
                getAllRuleTypes: function() {
                    return $q.when(ruleTypes);
                },
                getAllDestinationDispositionTypes: function() {
                    return $q.when(destinationDispositionTypes);
                },
                getAllPreProcessOperationTypes: function() {
                    return $q.when(preProcessOperationTypes);
                },
                getAllRemotePullDispositionTypes: function() {
                    return $q.when(remotePullDispositionTypes);
                },
                getAllProtocols: function() {
                    return $q.when(protocols);
                },
                getUserLoggedIn: function() {
                    return this.user;
                },
                setUserLoggedIn: function(user) {
                    this.user = user;
                },
                setRedirectAfterLogin: function(toState, toParams) {
                    this.redirect = {toState:toState, toParams:toParams}
                },
                getRedirectAfterLogin: function() {
                    return this.redirect;
                },
                doLogin: function(data) {
                    // return $http({
                    //     url: "http://192.168.130.13:8080/ghibli-wui-rest/login",
                    //     data: data,
                    //     method: "POST"
                    // });
                    var deferred = $q.defer();

                    if (data.username === 'lab' && data.password === 'lab') {
                        deferred.resolve({
                            data: 'Hello, ' + data.username + '!'
                        });
                    } else {
                        deferred.reject('unknown user or password');
                    }

                    return deferred.promise;
                },

                getClusterInfo: function() {
                    var temp = 'data/clusters.json';
                    var service = 'http://192.168.130.13:8080/ghibli-wui-rest/environment/clusters';
                    return $http({
                        method: 'GET',
                        url: temp,
                     });
                 }

            };
        }]);
})();
