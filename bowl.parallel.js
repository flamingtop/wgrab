
phantom.injectJs('include/underscore-min.js');
phantom.injectJs('include/xregexp-all-min.js');

var casper = require('casper').create();

var utils = require('utils');
var fs = require('fs');

var sites = [];
var suites = [];

if (!casper.cli.get(0) || !casper.cli.get(0).trim().length) {
    casper.echo("Use a search keyword.");
    casper.echo("bowl.js KEYWORD");
    casper.exit();
}

if (casper.cli.options['suites']) {
    // --suites
    suites = casper.cli.options['suites'].split(',');
    for (var i in suites) {
        sites = sites.concat(fs.read('suites/' + suites[i]).trim().split("\n"));
    };
    sites = _.uniq(sites);
} else if (casper.cli.options['sites']) {
    // --sites
    sites = casper.cli.get('sites').split(','); 
} else {
    // scrape all sites if nothing was specified
    sites = fs.list('sites/').filter(function(name) {
        return (name != '.' && name != '..');
    });
}

var bowl = {
    q: casper.cli.get(0),
    results: {},
    sites: {},
    input: {
        sites: sites
    }
};



var instances = {};
var done = {};

casper.start().each(bowl.input.sites, function(self, site) {
    var scrapper = 'sites/' + site;

    if (!fs.exists(scrapper)) {
        this.echo(scrapper + " doesn't exist. Skipped");
        return;
    }

    phantom.injectJs(scrapper);
 
    done[site] = false;
    instances[site] = require('casper').create({
        verbose: true,
        logLevel: "debug",
        clientScripts: ['include/jquery.min.js'],
        pageSettings: {
            loadImages: false,
            loadPlugins: false,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:19.0) Gecko/20100101 Firefox/19.0'
        }
    });
    instances[site]
        .start()
        .open(bowl.sites[site].url)
        .then(bowl.sites[site].process);
});



for (var s in instances) {
    instances[s].run(function(ss) {
        return function() {
           done[ss] = true;
        };
    }(s));
}


var check = function() {
    setTimeout(function() {

        utils.dump(done);

        var alldone = true;
        for (var i in done) {
            if (done[i] == false) {
                alldone = false;
                break;
            }
        }


        if (alldone) {
            console.log('all done');
            var template = fs.read('include/tmpl.html');
            var folder = 'results/' + bowl.q.replace(XRegExp('[^\\p{L}\\d]+', 'g'), '-');

            if (!fs.exists(folder)) {
                fs.makeTree(folder);
            }

            for (var site in bowl.results) {
                var file = folder + '/' + site + '.html';
                var data = {};
                data[site] = bowl.results[site];
                var output = _.template(template, {
                    q: bowl.q,
                    site: site,
                    data: data
                });
                fs.write(file, output);
            }
            casper.exit();
        } else {
            console.log('check');
            check();
        }

    }, 1000);
};

check();



