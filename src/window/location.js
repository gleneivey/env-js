/*
*	location.js
*   - requires env
*/
$debug("Initializing Window Location.");
//the current location
var $location = '';

$w.__defineSetter__("location", function(url){
    if ($w.$isOriginalWindow){
        if ($w.$haveCalledWindowLocationSetter)
            throw new Error("Cannot call 'window.location=' multiple times " +
              "from the context used to load 'env.js'.  Try using " +
              "'window.open()' to get a new context.");
        $w.$haveCalledWindowLocationSetter = true;
        $w.__loadAWindowsDocument__(url);
    }
    else {
        $env.$unloadEventsFor($w);
        var proxy = $w;
        if (proxy.$thisWindowsProxyObject)
            proxy = proxy.$thisWindowsProxyObject;
        $env.reloadAWindowProxy(proxy, url);
    }
});

$w.__loadAWindowsDocument__ = function(url){
    $location = $env.location(url);
    setHistory($location);
    $w.document.load($location);
};

$w.__defineGetter__("location", function(url){
	var hash 	 = new RegExp('(\\#.*)'),
		hostname = new RegExp('\/\/([^\:\/]+)'),
		pathname = new RegExp('(\/[^\\?\\#]*)'),
		port 	 = new RegExp('\:(\\d+)\/'),
		protocol = new RegExp('(^\\w*\:)'),
		search 	 = new RegExp('(\\?[^\\#]*)');
	return {
		get hash(){
			var m = hash.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set hash(_hash){
			//setting the hash is the only property of the location object
			//that doesn't cause the window to reload
			_hash = _hash.indexOf('#')===0?_hash:"#"+_hash;	
			$location = this.protocol + this.host + this.pathname + 
				this.search + _hash;
			setHistory(_hash, "hash");
		},
		get host(){
			return this.hostname + (this.port !== "")?":"+this.port:"";
		},
		set host(_host){
			$w.location = this.protocol + _host + this.pathname + 
				this.search + this.hash;
		},
		get hostname(){
			var m = hostname.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set hostname(_hostname){
			$w.location = this.protocol + _hostname + ((this.port==="")?"":(":"+this.port)) +
			 	 this.pathname + this.search + this.hash;
		},
		get href(){
			//This is the only env specific function
			return $location;
		},
		set href(url){
			$w.location = url;	
		},
		get pathname(){
			var m = this.href;
			m = pathname.exec(m.substring(m.indexOf(this.hostname)));
			return m&&m.length>1?m[1]:"/";
		},
		set pathname(_pathname){
			$w.location = this.protocol + this.host + _pathname + 
				this.search + this.hash;
		},
		get port(){
			var m = port.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set port(_port){
			$w.location = this.protocol + this.hostname + ":"+_port + this.pathname + 
				this.search + this.hash;
		},
		get protocol(){
			return this.href && protocol.exec(this.href)[0];
		},
		set protocol(_protocol){
			$w.location = _protocol + this.host + this.pathname + 
				this.search + this.hash;
		},
		get search(){
			var m = search.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set search(_search){
			$w.location = this.protocol + this.host + this.pathname + 
				_search + this.hash;
		},
		toString: function(){
			return this.href;
		},
        reload: function(force){
            // ignore 'force': we don't implement a cache
            var thisWindow = $w;
            $env.$unloadEventsFor(thisWindow);
            try { thisWindow = thisWindow.$thisWindowsProxyObject; }catch (e){}
            $env.reloadAWindowProxy(thisWindow, thisWindow.location.href);
        },
        replace: function(url){
            $location = url;
            $w.location.reload();
        }
    };
});

