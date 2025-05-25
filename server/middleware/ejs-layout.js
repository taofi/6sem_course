const fs = require('fs');
const path = require('path');

module.exports = function(req, res, next) {
    // Переопределяем метод render
    const _render = res.render;
    res.render = function(view, options, fn) {
        const self = this;
        
        // Если передана функция, вызываем оригинальный render
        if (typeof options === 'function') {
            return _render.call(self, view, options);
        }
        
        // Если указан layout
        if (options.layout !== false) {
            const layout = options.layout || 'main';
            const layoutPath = path.join(req.app.get('views'), 'layouts', layout + '.ejs');
            
            // Проверяем существует ли layout
            fs.access(layoutPath, fs.constants.F_OK, (err) => {
                if (err) {
                    // Если layout не найден, используем оригинальный render
                    _render.call(self, view, options, fn);
                } else {
                    // Рендерим view в переменную body
                    _render.call(self, view, options, (err, str) => {
                        if (err) return fn ? fn(err) : null;
                        
                        // Добавляем body в options и рендерим layout
                        options.body = str;
                        _render.call(self, 'layouts/' + layout, options, fn);
                    });
                }
            });
        } else {
            // Если layout отключен, используем оригинальный render
            _render.call(self, view, options, fn);
        }
    };
    next();
};