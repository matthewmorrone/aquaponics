// var parser = document.createElement('a');
// parser.href = "http://example.com:3000/pathname/?search=test#hash";

// parser.protocol; // => "http:"
// parser.hostname; // => "example.com"
// parser.port;     // => "3000"
// parser.pathname; // => "/pathname/"
// parser.search;   // => "?search=test"
// parser.hash;     // => "#hash"
// parser.host;     // => "example.com:3000"

(function (global) {

    var re = {
        starts_with_slashes: /^\/+/,
        ends_with_slashes: /\/+$/,
        pluses: /\+/g,
        query_separator: /[&;]/,
        url_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    };

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, scope) {
            for (var i = 0, len = this.length; i < len; ++i) {
                fn.call(scope || this, this[i], i, this);
            }
        };
    }

    function decode(s) {
        if (s) {
            s = decodeURIComponent(s);
            s = s.replace(re.pluses, ' ');
        }
        return s;
    }

    function parseURL(str) {
        var parser = re.url_parser;
        var parserKeys = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
        var m = parser.exec(str || '');
        var parts = {};

        parserKeys.forEach(function (key, i) {
            parts[key] = m[i] || '';
        });

        return parts;
    }

    function parseQuery(str) {
        var i, ps, p, n, k, v;
        var pairs = [];

        if (typeof (str) === 'undefined' || str === null || str === '') {
            return pairs;
        }

        if (str.indexOf('?') === 0) {
            str = str.substring(1);
        }

        ps = str.toString().split(re.query_separator);

        for (i = 0; i < ps.length; i++) {
            p = ps[i];
            n = p.indexOf('=');

            if (n !== 0) {
                k = decodeURIComponent(p.substring(0, n));
                v = decodeURIComponent(p.substring(n + 1));
                //pairs.push(n === -1 ? [p, null] : [k, v]);
                n === -1 ? pairs[p] = null : pairs[k] = v;
            }

        }
        return pairs;
    }

    function Url(str) {
        this.urlParts = parseURL(str);
        this.queryPairs = parseQuery(this.urlParts.query);
        this.hasAuthorityPrefixUserPref = null;
    }

    ['protocol', 'userInfo', 'host', 'port', 'path', 'anchor'].forEach(function (key) {
        Url.prototype[key] = function (val) {
            if (typeof val !== 'undefined') {
                this.urlParts[key] = val;
            }
            return this.urlParts[key];
        };
    });

    Url.prototype.hasAuthorityPrefix = function (val) {
        if (typeof val !== 'undefined') {
            this.hasAuthorityPrefixUserPref = val;
        }

        if (this.hasAuthorityPrefixUserPref === null) {
            return (this.urlParts.source.indexOf('//') !== -1);
        } else {
            return this.hasAuthorityPrefixUserPref;
        }
    };

    Url.prototype.query = function (val) {
        var s = '', i, param;

        if (typeof val !== 'undefined') {
            this.queryPairs = parseQuery(val);
        }

        for (i = 0; i < this.queryPairs.length; i++) {
            param = this.queryPairs[i];
            if (s.length > 0) {
                s += '&';
            }
            if (param[1] === null) {
                s += param[0];
            } else {
                s += param[0];
                s += '=';
                if (param[1]) {
                    s += encodeURIComponent(param[1]);
                }
            }
        }
        return s.length > 0 ? '?' + s : s;
    };

    Url.prototype.getQueryParamValue = function (key) {
        var param, i;
        for (i = 0; i < this.queryPairs.length; i++) {
            param = this.queryPairs[i];
            if (key === param[0]) {
                return param[1];
            }
        }
    };

    Url.prototype.getQueryParamValues = function (key) {
        var arr = [], i, param;
        for (i = 0; i < this.queryPairs.length; i++) {
            param = this.queryPairs[i];
            if (key === param[0]) {
                arr.push(param[1]);
            }
        }
        return arr;
    };

    Url.prototype.deleteQueryParam = function (key, val) {
        var arr = [], i, param, keyMatchesFilter, valMatchesFilter;

        for (i = 0; i < this.queryPairs.length; i++) {

            param = this.queryPairs[i];
            keyMatchesFilter = decode(param[0]) === decode(key);
            valMatchesFilter = param[1] === val;

            if ((arguments.length === 1 && !keyMatchesFilter) || (arguments.length === 2 && (!keyMatchesFilter || !valMatchesFilter))) {
                arr.push(param);
            }
        }

        this.queryPairs = arr;

        return this;
    };

    Url.prototype.addQueryParam = function (key, val, index) {
        if (arguments.length === 3 && index !== -1) {
            index = Math.min(index, this.queryPairs.length);
            this.queryPairs.splice(index, 0, [key, val]);
        } else if (arguments.length > 0) {
            this.queryPairs.push([key, val]);
        }
        return this;
    };

    Url.prototype.replaceQueryParam = function (key, newVal, oldVal) {
        var index = -1, i, param;

        if (arguments.length === 3) {
            for (i = 0; i < this.queryPairs.length; i++) {
                param = this.queryPairs[i];
                if (decode(param[0]) === decode(key) && decodeURIComponent(param[1]) === decode(oldVal)) {
                    index = i;
                    break;
                }
            }
            this.deleteQueryParam(key, oldVal).addQueryParam(key, newVal, index);
        } else {
            for (i = 0; i < this.queryPairs.length; i++) {
                param = this.queryPairs[i];
                if (decode(param[0]) === decode(key)) {
                    index = i;
                    break;
                }
            }
            this.deleteQueryParam(key);
            this.addQueryParam(key, newVal, index);
        }
        return this;
    };

    ['protocol', 'hasAuthorityPrefix', 'userInfo', 'host', 'port', 'path', 'query', 'anchor'].forEach(function (key) {
        var method = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
        Url.prototype[method] = function (val) {
            this[key](val);
            return this;
        };
    });

    Url.prototype.scheme = function () {
        var s = '';

        if (this.protocol()) {
            s += this.protocol();
            if (this.protocol().indexOf(':') !== this.protocol().length - 1) {
                s += ':';
            }
            s += '//';
        } else {
            if (this.hasAuthorityPrefix() && this.host()) {
                s += '//';
            }
        }

        return s;
    };

    Url.prototype.origin = function () {
        var s = this.scheme();

        if (s == 'file://') {
            return s + this.urlParts.authority;
        }

        if (this.userInfo() && this.host()) {
            s += this.userInfo();
            if (this.userInfo().indexOf('@') !== this.userInfo().length - 1) {
                s += '@';
            }
        }

        if (this.host()) {
            s += this.host();
            if (this.port()) {
                s += ':' + this.port();
            }
        }

        return s;
    };

    Url.prototype.addTrailingSlash = function () {
        var path = this.path() || '';

        if (path.substr(-1) !== '/') {
            this.path(path + '/');
        }

        return this;
    };

    Url.prototype.toString = function () {
        var path, s = this.origin();

        if (this.path()) {
            path = this.path();
            if (!(re.ends_with_slashes.test(s) || re.starts_with_slashes.test(path))) {
                s += '/';
            } else {
                if (s) {
                    s.replace(re.ends_with_slashes, '/');
                }
                path = path.replace(re.starts_with_slashes, '/');
            }
            s += path;
        } else {
            if (this.host() && (this.query().toString() || this.anchor())) {
                s += '/';
            }
        }
        if (this.query().toString()) {
            if (this.query().toString().indexOf('?') !== 0) {
                s += '?';
            }
            s += this.query().toString();
        }

        if (this.anchor()) {
            if (this.anchor().indexOf('#') !== 0) {
                s += '#';
            }
            s += this.anchor();
        }

        return s;
    };

    Url.prototype.clone = function () {
        return new Url(this.toString());
    };

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Url;
        });
    } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Url;
    } else {
        global.Url = Url;
    }
}(this));
