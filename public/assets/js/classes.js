
(function (root) {
    
    if (!!!root.NavItem) {
        
        root.NavItem = function (text, path, route) {
            
            this.text = text || '';
            this.path = path || '';
            this.route = route || '';
            
            this.condition = function () { return true; };
        };
    }
})(this);