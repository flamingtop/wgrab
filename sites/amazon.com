
// not working well
bowl.sites['amazon.com'] = {
    url: 'http://amazon.com',
    process: function() {

        this.then(function() {
            this.fill('form[name=site-search]', {'field-keywords': bowl.q}, true);
        });

        this.then(function() {
                var data = this.evaluate(function() {
                    var things = [];
                    $('.results .rslt > h3 > a').each(function() {
                        things.push({
                            title: $(this).text(),
                            link: $(this).parent().attr('href')
                        });
                    });
                    return things;
                });
                bowl.results['amazon.com'] = data;
        });

    }
};


