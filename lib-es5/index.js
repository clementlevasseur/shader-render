"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
        function shaderrender(canvas) {
                _classCallCheck(this, shaderrender);

                this.canvas = canvas;
                this.vertexPositionBuffer = null;
                this.gl = null;
                this.shaderProgram = null;
                this.aVertexPosition = null;
                this.webgl_shaderElementName = null;
                this.timer_count = 0;
                this.lastTime = 0;
                this.normalisedTime = 0;

                this.beforeRender = function () {};
        }

        _createClass(shaderrender, [{
                key: "initGL",
                value: function initGL() {
                        try {
                                this.gl = this.canvas.getContext("experimental-webgl");
                                this.gl.viewportWidth = this.canvas.width;
                                this.gl.viewportHeight = this.canvas.height;
                        } catch (e) {
                                throw [e, "Could not initialise WebGL, sorry :-("];
                        }
                        if (!this.gl) {
                                throw "Could not initialise WebGL, sorry :-(";
                        }
                }
        }, {
                key: "createShaderProgram",
                value: function createShaderProgram(gl, vs, fs) {

                        this.shaderProgram = this.gl.createProgram();

                        //  Create vertex shader


                        var vshader = this.gl.createShader(this.gl.VERTEX_SHADER);
                        this.gl.shaderSource(vshader, vs);
                        this.gl.compileShader(vshader);

                        if (!this.gl.getShaderParameter(vshader, this.gl.COMPILE_STATUS)) {
                                console.warn("Vertex shader compilation error\n" + this.gl.getShaderInfoLog(vshader) + "\n\n--\n" + vs);
                                return null;
                        }

                        //  Create fragment shader


                        var fshader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
                        this.gl.shaderSource(fshader, fs);
                        this.gl.compileShader(fshader);

                        if (!this.gl.getShaderParameter(fshader, this.gl.COMPILE_STATUS)) {
                                console.warn("Fragment shader compilation error\n" + this.gl.getShaderInfoLog(fshader) + "\n\n--\n" + fs);
                                return null;
                        }

                        //  Create and link program


                        this.gl.attachShader(this.shaderProgram, vshader);

                        this.gl.attachShader(this.shaderProgram, fshader);

                        this.gl.linkProgram(this.shaderProgram);

                        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {

                                return null;
                        }

                        return this.shaderProgram;
                }
        }, {
                key: "initShaders",
                value: function initShaders() {

                        var vs = "#ifdef GL_ES\nprecision mediump float;\n#endif\n" + "attribute vec3 aVertexPosition; uniform float uTime; varying vec3 vPosition;" + "void main(void) { gl_Position = vec4(aVertexPosition, 1.0); vPosition = aVertexPosition; }";

                        var fs = this.webgl_shaderElement;

                        this.shaderProgram = this.createShaderProgram(this.gl, vs, fs);
                        if (!this.shaderProgram) {
                                console.warn('Could not create shader program');
                        }

                        //  Create the vertex array buffers

                        this.gl.useProgram(this.shaderProgram);

                        this.aVertexPosition = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
                        this.gl.enableVertexAttribArray(this.aVertexPosition);
                }
        }, {
                key: "initBuffers",
                value: function initBuffers() {

                        this.vertexPositionBuffer = this.gl.createBuffer();
                        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
                        var vertices = [1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
                        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
                        this.vertexPositionBuffer.itemSize = 3;
                        this.vertexPositionBuffer.numItems = 4;
                }
        }, {
                key: "render",
                value: function render() {
                        this.timer_count++;

                        if (this.timer_count == 1) {}

                        var timeNow = new Date().getTime();

                        if (this.lastTime !== 0) {
                                var elapsed = timeNow - this.lastTime;

                                this.normalisedTime += elapsed;
                        }

                        var timeUniform = this.gl.getUniformLocation(this.shaderProgram, "iGlobalTime");
                        this.gl.uniform1f(timeUniform, this.normalisedTime / 1000.0);
                        var resolutionUniform = this.gl.getUniformLocation(this.shaderProgram, "iResolution");
                        this.gl.uniform3f(resolutionUniform, this.gl.viewportWidth, this.gl.viewportHeight, 1.0);

                        this.beforeRender();

                        this.lastTime = timeNow;

                        //  Draw

                        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

                        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
                        this.gl.vertexAttribPointer(this.aVertexPosition, this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

                        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexPositionBuffer.numItems);
                }
        }, {
                key: "init",
                value: function init(shaderElement) {

                        this.webgl_shaderElement = shaderElement;

                        this.initGL();
                        this.initShaders();
                        this.initBuffers();

                        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
                        this.gl.clearDepth(1.0);

                        this.gl.enable(this.gl.BLEND);
                        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

                        this.gl.enable(this.gl.DEPTH_TEST);
                        this.gl.depthFunc(this.gl.LEQUAL);
                }
        }, {
                key: "start",
                value: function start() {
                        setInterval(this.render.bind(this), 15);
                }
        }]);

        return shaderrender;
}();