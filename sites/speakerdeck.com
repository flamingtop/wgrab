plugins['speakerdeck.com'] = {
    url: 'http://speakerdeck.com',
    process: function() {
        
        this.then(function() {
            this.fill('form#search_form', {'q': input.q}, true);
        });

        this.then(function() {
            var data = this.evaluate(function() {
                var things = [];
                $('.talk .title a').each(function() {
                    things.push({
                        title: $(this).text(),
                        link: 'http://speakerdeck.com' + $(this).attr('href')
                    });
                });
                return things;
            });
            RESULTS['speakerdeck.com'] = data;
        });

    }

};


