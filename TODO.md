Navigation
- $navigationProvider as a wrapper for $routeProvider
- provides routes to $routeProvider and also provides functionality to modules
- $globalNav is a universal provider that gives access to any assigned navigation item
- $localNav is available only within the module and also stores navigation items
- navigation nodes are configured on the $navigationProvider and made available by the above factories
- additional configuration can be performed on a node-by-node basis; factories contain an easily-accessible list of all nodes for simple reference

Password Storage
- implement better (more secure) method for storing password and username info for local accounts

Social Auth
- implement Google authentication
- implement Facebook authentication
