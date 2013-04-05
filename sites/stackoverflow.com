plugins['stackoverflow.com'] = {
    url: 'http://stackoverflow.com',
    process: function() {
        this.thenOpen("http://stackoverflow.com/search?tab=votes&q=" + input.q);
        this.then(function() {
            this.click('#tabs a[title*=vote]');
        });
        this.then(function() {
            var data = this.evaluate(function() {
                var things = [];
                var selector = /tagged/.test(location.href) ? '.question-hyperlink' : '.result-link a';
                $(selector).each(function() {
                    things.push({
                        title: $(this).html(),
                        link: 'http://stackoverflow.com' + $(this).attr('href')
                    });
                });
                return things;
            });
            RESULTS['stackoverflow.com'] = data;
        });

    }

};


