
// not working well
plugins['amazon.com'] = {
    url: 'http://amazon.com',
    process: function() {
        this.then(function() {
            this.fill('form[name=site-search]', {'field-keywords': input.q}, true);
        });
        this.then(function() {
            var data = this.evaluate(function() {
                var things = [];
                $('.results .rslt > h3 > a').each(function() {
                    things.push({
                        title: $(this).html(),
                        link: $(this).attr('href')
                    });
                });
                return things;
            });
            RESULTS['amazon.com'] = data;
        });
    }
};


