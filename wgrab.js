
phantom.injectJs('include/underscore-min.js');
phantom.injectJs('include/xregexp-all-min.js');

var 
casper = require('casper').create(),
utils = require('utils'),
fs = require('fs'),
cli = casper.cli;

var
plugins = {},
RESULTS = {};

var 
input = {};
input.q = (cli.has(0) && cli.get(0).trim().length > 0) ? cli.get(0).trim() : null;
input.suites = (cli.has('suites') && cli.get('suites').trim().length > 0) ? cli.get('suites').trim().split(',') : [];
input.sites = (cli.has('sites') && cli.get('sites').trim().length > 0) ? cli.get('sites').trim().split(',') : [];
input.debug = cli.has('debug') ? true : false;
input.verbose = cli.has('verbose') ? true : false;

input.q || casper.die("Please specify a search keyword.", 1);

// sites to scrape
input.sites = getSites();

// scrape each and every site in input.sites
// results pushed into RESULTS
var jobs = run(input.sites);

// constantly check jobs status
// if all jobs are done, flush the results to files, otherwise keep ticking
tick(jobs);

///////////////////////////////////////////////////////////

function tick(jobs) {
    setTimeout(function() {

        var alldone = true;

        for (var s in jobs) {
            if (plugins[s].done === undefined) {
                alldone = false;
                break;
            }
        }

        if (alldone) {

            var template = fs.read('include/tmpl.html');
            var folder = 'results/' + input.q.replace(XRegExp('[^\\p{L}\\d]+', 'g'), '-');

            if (!fs.exists(folder)) {
                fs.makeTree(folder);
            }

            for (var site in RESULTS) {
                var file = folder + '/' + site + '.html';
                var data = {};
                data[site] = RESULTS[site];
                var html = _.template(template, {
                    q: input.q,
                    site: site,
                    data: data
                });
                fs.write(file, html);
            }

            var all = folder + '/all.html';
            var allOutput = _.template(template, {
                q: input.q,
                site: 'All',
                data: RESULTS
            });
            fs.write(all, allOutput);

            console.log('All done');
            casper.exit();

        } else {
            tick(jobs);
        }

    }, 1000);
};

function getSites() {
   var sites = [];
    if (!input.suites && !input.sites) {
        sites = fs.list('sites/').filter(function(name) {
            return (name != '.' && name != '..');
        });
    } else {
        sites = sites.concat(input.sites);
        for (var i in input.suites) {
            sites = sites.concat(fs.read('suites/' + input.suites[i]).trim().split("\n"));
        }
    }
    return sites;
}

function run(sites) {
    var jobs = {};
    
    _.each(sites, function(site) {
        var scrapper = 'sites/' + site;
        fs.exists(scrapper) || this.die(scrapper + " doesn't exist. Skipped", 1);

        phantom.injectJs(scrapper);
        
        jobs[site] = require('casper').create({
            verbose: input.verbose,
            logLevel: input.debug ? "debug" : "info",
            clientScripts: ['include/jquery.min.js'],
            pageSettings: {
                loadImages: false,
                loadPlugins: false,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:19.0) Gecko/20100101 Firefox/19.0'
            }
        });
        jobs[site]
            .start()
            .open(plugins[site].url)
            .then(plugins[site].process)
            .run(function() {
                plugins[site]['done'] = true;
            });
    });

    return jobs;
}

