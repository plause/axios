describe('instance', function () {
  beforeEach(function () {
    jasmine.Ajax.install();
  });

  afterEach(function () {
    jasmine.Ajax.uninstall();
  });

  it('should have the same methods as default instance', function () {
    var instance = axios.create();

    for (var prop in axios) {
      if ([
        'Axios',
        'create',
        'Cancel',
        'CancelToken',
        'isCancel',
        'all',
        'spread',
        'isAxiosError',
        'VERSION',
        'default'].indexOf(prop) > -1) {
        continue;
      }
      expect(typeof instance[prop]).toBe(typeof axios[prop]);
    }
  });

  it('should make an http request without verb helper', function (done) {
    var instance = axios.create();

    instance('/foo');

    getAjaxRequest().then(function (request) {
      expect(request.url).toBe('/foo');
      done();
    });
  });

  it('should make an http request with url instead of baseURL', function (done) {
    var instance = axios.create({
      url: 'https://api.example.com'
    });

    instance('/foo');

    getAjaxRequest().then(function (request) {
      expect(request.url).toBe('/foo');
      done();
    });
  });

  it('should make an http request', function (done) {
    var instance = axios.create();

    instance.get('/foo');

    getAjaxRequest().then(function (request) {
      expect(request.url).toBe('/foo');
      done();
    });
  });

  it('should use instance options', function (done) {
    var instance = axios.create({ timeout: 1000 });

    instance.get('/foo');

    getAjaxRequest().then(function (request) {
      expect(request.timeout).toBe(1000);
      done();
    });
  });

  it('should have defaults.headers', function () {
    var instance = axios.create({
      baseURL: 'https://api.example.com'
    });

    expect(typeof instance.defaults.headers, 'object');
    expect(typeof instance.defaults.headers.common, 'object');
  });

  it('should have interceptors on the instance', function (done) {
    axios.interceptors.request.use(function (config) {
      config.foo = true;
      return config;
    });

    var instance = axios.create();
    instance.interceptors.request.use(function (config) {
      config.bar = true;
      return config;
    });

    var response;
    instance.get('/foo').then(function (res) {
      response = res;
    });

    getAjaxRequest().then(function (request) {
      request.respondWith({
        status: 200
      });

      setTimeout(function () {
        expect(response.config.foo).toEqual(undefined);
        expect(response.config.bar).toEqual(true);
        done();
      }, 100);
    });
  });

  describe("getUri method", function () {
    it('should compute request uri based on merged config', function () {
      var params = { page: 1 };
      var config = { url: '/u3', params, paramsSerializer: () => 'page=3' };

      expect(instance.getUri({ url: '/u1' })).toBe('/u1');
      expect(instance.getUri({ url: '/u2', params })).toBe('/u2?page=1');
      expect(instance.getUri(config)).toBe('/u3?page=3');
    });

    it('should honor baseURL when a flag is set', function () {
      var url = '/path/to/resource';
      var baseURL = 'https://some-domain.com';

      expect(instance.getUri({ url, baseURL })).toBe(url);
      expect(instance.getUri({ url, baseURL }, true)).toBe(`${baseURL}${url}`);
    });
  })

});
