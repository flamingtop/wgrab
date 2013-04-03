// Written by Shawn X. <shallway.xu@gmail.com>

// weapons of mass desctruction
phantom.injectJs('include/underscore-min.js');
phantom.injectJs('include/xregexp-all-min.js');

var 
// The master casper instance, which doesn't do any scraping by itself
casper = require('casper').create(),
// utils helpers, see http://casperjs.org/api.html#utils
utils = require('utils'),
// filesystem helpers, see https://github.com/ariya/phantomjs/wiki/API-Reference-FileSystem
fs = require('fs'),
// scrapper instances
instances = {},
// status
done = {},
// things to be passed to the scrappers explicitly
bowl = {
    // the search keyword
    q: casper.cli.get(0),
    // the results placeholder
    results: {},
    sites: {},
    input: {}
};

if (!casper.cli.get(0) || !casper.cli.get(0).trim().length) {
    casper.echo("Use a search keyword.");
    casper.echo("bowl.js KEYWORD");
    casper.exit();
}

/* figure out sites to scrape */
if (casper.cli.options['suites']) {
    // option --suites
    var suites = casper.cli.options['suites'].split(',');
    for (var i in suites) {
        // var sites = sites.concat(fs.read('suites/' + suites[i]).trim().split("\n"));
        var sites = fs.read('suites/' + suites[i]).trim().split("\n");
    };
    bowl.input.sites = _.uniq(sites);
} else if (casper.cli.options['sites']) {
    // option --sites
    bowl.input.sites = casper.cli.get('sites').split(','); 
} else {
    bowl.input.sites = fs.list('sites/').filter(function(name) {
        return (name != '.' && name != '..');
    });
}

/* scrape! in parallel */
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

        var alldone = true;
        for (var i in done) {
            if (done[i] === false) {
                alldone = false;
                break;
            }
        }

        if (alldone) {

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

            var all = folder + '/all.html';
            var allOutput = _.template(template, {
                q: bowl.q,
                site: 'All',
                data: bowl.results
            });
            fs.write(all, allOutput);

            casper.exit();

        } else {
            console.log('tick');
            check();
        }

    }, 1000);
};

check();



