bowl.sites['stackoverflow.com'] = {
    url: 'http://stackoverflow.com',
    process: function() {
        this.thenOpen("http://stackoverflow.com/search?tab=votes&q=" + bowl.q);
        this.then(function() {
            this.click('#tabs a[title*=vote]');
        });
        this.then(function() {
            var data = this.evaluate(function() {
                var things = [];
                var selector = /tagged/.test(location.href) ? '.question-hyperlink' : '.result-link a';
                $(selector).each(function() {
                    things.push({
                        title: $(this).text(),
                        link: 'http://stackoverflow.com' + $(this).attr('href')
                    });
                });
                return things;
            });
            bowl.results['stackoverflow.com'] = data;
        });

    }

};

