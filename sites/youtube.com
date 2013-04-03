plugins['youtube.com'] = {
    url: 'http://youtube.com',
    process: function() {
        
        this.then(function() {
            this.fill('form#masthead-search', {'search_query': input.q}, true);
        });

        this.then(function() {
            var data = this.evaluate(function() {
                var things = [];
                $('.yt-uix-tile-link').each(function() {
                    things.push({
                        title: $(this).text(),
                        link: "http://youtube.com" + $(this).attr('href')
                    });
                });
                return things;
            });
            output.results['youtube.com'] = data;
        });

    }

};


