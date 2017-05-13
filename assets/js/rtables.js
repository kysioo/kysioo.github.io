var proxy = 'https://toyorg.herokuapp.com/proxy.php?url='; // CORS
var url = 'https://inf.ug.edu.pl/plan/index.php?format=json';
var source = document.querySelector("#external").innerHTML;

Handlebars.registerHelper('equal', function (lvalue, lvalue2, rvalue, rvalue2, options) {
    if (arguments.length < 2)
        throw new Error("Handlebars Helper equal needs 1 parameters");
    if (lvalue == getURLParameter(rvalue) || lvalue2 == getURLParameter(rvalue2)) {
        return options.fn(this);
    } else {
        return options.inverse(this);

    }
});

Handlebars.registerHelper("distinct", function (listOfObjects, property, options) {
    var unique = {};
    var distinctList = [];
    for (var objectIndex in listOfObjects) {
        var object = listOfObjects[objectIndex];
        if (typeof (unique[object[property]]) == "undefined") {
            distinctList.push(object[property]);
        }
        unique[object[property]] = 0;
    }
    return options.fn(distinctList);
});

Handlebars.registerHelper('replace', function (text, one, two) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(new RegExp(one, 'g'), two);
    return new Handlebars.SafeString(text);
});

if (statuslocalStorage('plan') || localStorage.getItem('plan') === null || localStorage.getItem('plan') === undefined) {
    $.ajax({
        url: proxy + url,
        dataType: 'jsonp',
        success: function (data) {
            console.log('url');
            setlocalStorage('plan', JSON.stringify(data));
            var template = Handlebars.compile(source);
            var html = template(JSON.parse(localStorage.getItem('plan')));
            document.querySelector("header").insertAdjacentHTML('afterend', html);
        },
        error: function (msg) {
            console.log(JSON.stringify(msg));
        }
    });
} else {
    var template = Handlebars.compile(source);
    var html = template(JSON.parse(localStorage.getItem('plan')));
    document.querySelector("header").insertAdjacentHTML('afterend', html);
    //debug
    console.log('localStorage expires on ' + new Date(1000*localStorage.getItem('plan_time')).toLocaleString());
}

function setlocalStorage(name, value, expires) {
    if (expires === undefined || expires === null) {
        var expires = 86400;
    }
    var date = new Date();
    var schedule = Math.round((date.setSeconds(date.getSeconds() + expires)) / 1000);
    localStorage.setItem(name, value);
    localStorage.setItem(name + '_time', schedule);
}

function statuslocalStorage(name) {
    var date = new Date();
    var current = Math.round(+date / 1000);
    var stored_time = localStorage.getItem(name + '_time');
    if (stored_time === undefined || stored_time === null) {
        var stored_time = 0;
    }
    if (stored_time < current) {
        localStorage.removeItem(name);
        localStorage.removeItem(name + '_time');
        return true;
    } else {
        return false;
    }
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1]) || null;
}

function changeUrlParam(param, value) {
    window.history.pushState(null, null, window.location.pathname);
    var currentURL = window.location.href + '&';
    var change = new RegExp('(' + param + ')=(.*)&', 'g');
    var newURL = currentURL.replace(change, '$1=' + value + '&');

    if (getURLParameter(param) !== null) {
        try {
            window.history.replaceState('', '', newURL.slice(0, -1));
        } catch (e) {
            console.log(e);
        }
    } else {
        var currURL = window.location.href;
        if (currURL.indexOf("?") !== -1) {
            window.history.replaceState('', '', currentURL.slice(0, -1) + '&' + param + '=' + value);
        } else {
            window.history.replaceState('', '', currentURL.slice(0, -1) + '?' + param + '=' + value);
        }
    }
    location.reload(true);
}

function removeDuplicates(param) {
    var seen = {};
    $(param).each(function () {
        var txt = $(this).text().replace(/(..:..)/g, "");
        if (seen[txt])
            $(this).remove();
        else
            seen[txt] = true;
    });
}

function sortTable(param) {
    var option = $(param + ' option');
    option.sort(function (a, b) {
        if (a.text > b.text) return 1;
        else if (a.text < b.text) return -1;
        else return 0;
    });
    $(param).html(option);
}

$(window).on("load", function () {
    var state = document.readyState;
    if (state == 'interactive') {
        document.getElementById('content').style.display = "none";
    } else if (state == 'complete') {
        setTimeout(function () {
            $('#selectg').val(getURLParameter('grupa'));
            $('#selectn').val(getURLParameter('nauczyciel'));
            document.getElementById('interactive');
            document.getElementById('fountainG').style.display = "none";
            document.getElementById('content').style.display = "inline";
        }, 1000);
    } // http://cssload.net/

    $(document).on('change', '#selectg', function () {
        var e = $(this).find('option:selected').val();
        changeUrlParam('grupa', e);
    });

    $(document).on('change', '#selectn', function () {
        var e = $(this).find('option:selected').val();
        changeUrlParam('nauczyciel', e);
    });

    removeDuplicates('table tr');
    removeDuplicates('.table-body');

    sortTable('#selectn');
    sortTable('#selectg');
});
