bowl.sites['google.com'] = {
    url: 'http://google.com',
    process: function() {
        
        this.then(function() {
            this.fill('form', {'q': bowl.q}, true);
        });

        this.then(function() {
            var data = this.evaluate(function() {
                var things = [];
                $('.r .l').each(function() {
                    things.push({
                        title: $(this).text(),
                        link: $(this).attr('href')
                    });
                });
                return things;
            });
            bowl.results['google.com'] = data;
        });

    }

};


