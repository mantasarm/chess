
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = new Int32Array();

function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedFloat64Memory0 = new Float64Array();

function getFloat64Memory0() {
    if (cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_24(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd055fb6ceb47b338(arg0, arg1);
}

function __wbg_adapter_27(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h416f9bd83a3f933a(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbg_error_269a12eec4874463 = function(arg0, arg1) {
        console.error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_instanceof_WebGl2RenderingContext_fcfa91cd777063f3 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WebGL2RenderingContext;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_bindBufferBase_a7ee98c55bf8380e = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bindBufferBase(arg1 >>> 0, arg2 >>> 0, getObject(arg3));
    };
    imports.wbg.__wbg_bindVertexArray_9d12800e272184b0 = function(arg0, arg1) {
        getObject(arg0).bindVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_bufferData_8d206d7adf6751c0 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferSubData_0e04c6c7fec3c949 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
    };
    imports.wbg.__wbg_createVertexArray_8467a75e68fec199 = function(arg0) {
        const ret = getObject(arg0).createVertexArray();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteVertexArray_00194a31d79df7e5 = function(arg0, arg1) {
        getObject(arg0).deleteVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_drawArraysInstanced_951a1d7e32c4f855 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_drawElementsInstanced_2e05a96af17fe284 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawElementsInstanced(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_getUniformBlockIndex_a6f3a994dcc7399d = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformBlockIndex(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return ret;
    };
    imports.wbg.__wbg_readPixels_e855be1f94815442 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    }, arguments) };
    imports.wbg.__wbg_readPixels_5d4e6205291096f0 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7);
    }, arguments) };
    imports.wbg.__wbg_texImage2D_1bc6fe2370a72e1c = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_421e29fed0db07ab = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_f06e46b3b25ee691 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
    }, arguments) };
    imports.wbg.__wbg_uniformBlockBinding_50ced0c985f91a02 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniformBlockBinding(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_vertexAttribDivisor_2dc16945a591d4c6 = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_activeTexture_6a9afd67cc0ade73 = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_attachShader_90ad543fb1bccb18 = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_bindBuffer_66e359418f5c82d7 = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindFramebuffer_5c01742edd5d843a = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindTexture_ae9620ea4a6ffb97 = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_blendEquation_72746aedc87e3f72 = function(arg0, arg1) {
        getObject(arg0).blendEquation(arg1 >>> 0);
    };
    imports.wbg.__wbg_blendEquationSeparate_f0abe930082fff02 = function(arg0, arg1, arg2) {
        getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFunc_99b48b64bde98c6f = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFuncSeparate_cecb7dfda39dc38d = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_checkFramebufferStatus_43ce263705fcbcbb = function(arg0, arg1) {
        const ret = getObject(arg0).checkFramebufferStatus(arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_clear_05614d3b84e96aae = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__wbg_clearColor_bc89a6580c0498c3 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_clearDepth_f378f35ef0d6d985 = function(arg0, arg1) {
        getObject(arg0).clearDepth(arg1);
    };
    imports.wbg.__wbg_clearStencil_5839f362722197b4 = function(arg0, arg1) {
        getObject(arg0).clearStencil(arg1);
    };
    imports.wbg.__wbg_colorMask_12687df5490e9bc9 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_compileShader_822f38928f6f2a08 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_createBuffer_a6cffb7f7d5b92a3 = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createFramebuffer_d5f3985ce3652661 = function(arg0) {
        const ret = getObject(arg0).createFramebuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_dc6b23d3caa1d86e = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_46a66dce5a9e22d0 = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_269f67d411bdc4dc = function(arg0) {
        const ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_cullFace_d6b862a4ad70b414 = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_deleteBuffer_12fd7d93834069ef = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteFramebuffer_d7551444a28f508e = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteProgram_ce56000628d7f1ce = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_deleteShader_246e6e678f3eb957 = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_68a539339fd87792 = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_depthFunc_1015c3364a49cd2f = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__wbg_depthMask_55f538b7411e5023 = function(arg0, arg1) {
        getObject(arg0).depthMask(arg1 !== 0);
    };
    imports.wbg.__wbg_disable_1659dc1efb5fb934 = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__wbg_drawArrays_d587302f7a868d91 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_drawElements_241caa588795bcb1 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    };
    imports.wbg.__wbg_enable_4791414dce6f602a = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_a1ffc091f3999354 = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_framebufferTexture2D_4b810902dffa1ef3 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__wbg_generateMipmap_284265abe05bc94c = function(arg0, arg1) {
        getObject(arg0).generateMipmap(arg1 >>> 0);
    };
    imports.wbg.__wbg_getActiveUniform_97472b76b9daa461 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getExtension_e7912bce04869d40 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getParameter_4e2ccc745690476a = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getParameter(arg1 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getProgramInfoLog_1e37a3d1d090ec1c = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getProgramParameter_acf4ae158143e2b2 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_451545b963646762 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getShaderParameter_6cd8c36fded266ea = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getSupportedExtensions_b84494641d686623 = function(arg0) {
        const ret = getObject(arg0).getSupportedExtensions();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_0da0c93f626244a2 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_linkProgram_c33885d9ea798810 = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_pixelStorei_51c83dc5117bea35 = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_scissor_b1b9e314ab6aac29 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_shaderSource_5111981e7afb61fb = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_stencilFunc_f0987b2c098f9f5e = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilFunc(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_4eb0f989e4108b15 = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilOp_88ffefa17fec4c07 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilOp(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_texParameteri_21fd6b6b394882c9 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_uniform1i_49986febd844f2c4 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_useProgram_35a58ac1e0d9577b = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_vertexAttribPointer_3b06d737566f0745 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_viewport_319ab5302767fcc9 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_instanceof_Window_acc97ff9f5d2c7b4 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_document_3ead31dbcad65886 = function(arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_devicePixelRatio_476ddb014eb2520a = function(arg0) {
        const ret = getObject(arg0).devicePixelRatio;
        return ret;
    };
    imports.wbg.__wbg_open_8b947bc096f5bb21 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_requestAnimationFrame_4181656476a7d86c = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setProperty_e489dfd8c0a6bffc = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_top_af8250f1ed584537 = function(arg0) {
        const ret = getObject(arg0).top;
        return ret;
    };
    imports.wbg.__wbg_left_e700000a247fe781 = function(arg0) {
        const ret = getObject(arg0).left;
        return ret;
    };
    imports.wbg.__wbg_drawArraysInstancedANGLE_89a45d6f51cd0483 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawArraysInstancedANGLE(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_drawElementsInstancedANGLE_6ac21f9a1ebe5f6b = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawElementsInstancedANGLE(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_vertexAttribDivisorANGLE_d5931335aaf0c735 = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttribDivisorANGLE(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_pointerId_18be034781db46f3 = function(arg0) {
        const ret = getObject(arg0).pointerId;
        return ret;
    };
    imports.wbg.__wbg_pointerType_bf6b13edfec8614b = function(arg0, arg1) {
        const ret = getObject(arg1).pointerType;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_deltaX_6b627fd6f4c19e51 = function(arg0) {
        const ret = getObject(arg0).deltaX;
        return ret;
    };
    imports.wbg.__wbg_deltaY_a5393ec7ac0f7bb4 = function(arg0) {
        const ret = getObject(arg0).deltaY;
        return ret;
    };
    imports.wbg.__wbg_clientX_e39206f946859108 = function(arg0) {
        const ret = getObject(arg0).clientX;
        return ret;
    };
    imports.wbg.__wbg_clientY_e376bb2d8f470c88 = function(arg0) {
        const ret = getObject(arg0).clientY;
        return ret;
    };
    imports.wbg.__wbg_button_2bb5dc0116d6b89b = function(arg0) {
        const ret = getObject(arg0).button;
        return ret;
    };
    imports.wbg.__wbg_movementX_f5947c282009d740 = function(arg0) {
        const ret = getObject(arg0).movementX;
        return ret;
    };
    imports.wbg.__wbg_movementY_2c81eed268321a0a = function(arg0) {
        const ret = getObject(arg0).movementY;
        return ret;
    };
    imports.wbg.__wbg_addEventListener_cbe4c6f619b032f3 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_bindVertexArrayOES_84540c072ea96b75 = function(arg0, arg1) {
        getObject(arg0).bindVertexArrayOES(getObject(arg1));
    };
    imports.wbg.__wbg_createVertexArrayOES_00a5c523e5b17eff = function(arg0) {
        const ret = getObject(arg0).createVertexArrayOES();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteVertexArrayOES_98b83132b3d85825 = function(arg0, arg1) {
        getObject(arg0).deleteVertexArrayOES(getObject(arg1));
    };
    imports.wbg.__wbg_now_8172cd917e5eda6b = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_body_3cb4b4042b9a632b = function(arg0) {
        const ret = getObject(arg0).body;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_fullscreen_2a4a5988638faa9e = function(arg0) {
        const ret = getObject(arg0).fullscreen;
        return ret;
    };
    imports.wbg.__wbg_pointerLockElement_71104c67b1b47607 = function(arg0) {
        const ret = getObject(arg0).pointerLockElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createElement_976dbb84fe1661b5 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_exitFullscreen_1510ded2ca20d624 = function(arg0) {
        getObject(arg0).exitFullscreen();
    };
    imports.wbg.__wbg_exitPointerLock_1405aae165b47bfd = function(arg0) {
        getObject(arg0).exitPointerLock();
    };
    imports.wbg.__wbg_getElementById_3a708b83e4f034d7 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_id_cd50e7899661ceb1 = function(arg0, arg1) {
        const ret = getObject(arg1).id;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_setid_d6ea60ebd257fe07 = function(arg0, arg1, arg2) {
        getObject(arg0).id = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_clientWidth_999b9163952471ee = function(arg0) {
        const ret = getObject(arg0).clientWidth;
        return ret;
    };
    imports.wbg.__wbg_clientHeight_1fc8bff4acf145b1 = function(arg0) {
        const ret = getObject(arg0).clientHeight;
        return ret;
    };
    imports.wbg.__wbg_getAttribute_3a1f0fb396184372 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1).getAttribute(getStringFromWasm0(arg2, arg3));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getBoundingClientRect_06acb6ac1c23e409 = function(arg0) {
        const ret = getObject(arg0).getBoundingClientRect();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestFullscreen_7d41309612540445 = function() { return handleError(function (arg0) {
        getObject(arg0).requestFullscreen();
    }, arguments) };
    imports.wbg.__wbg_requestPointerLock_3bc7c389fbad1a71 = function(arg0) {
        getObject(arg0).requestPointerLock();
    };
    imports.wbg.__wbg_setAttribute_d8436c14a59ab1af = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_style_e9380748cee29f13 = function(arg0) {
        const ret = getObject(arg0).style;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_WebGlRenderingContext_09249c25390b881f = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WebGLRenderingContext;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_bufferData_a33528a74dd300f4 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferSubData_a116fea11850b38f = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
    };
    imports.wbg.__wbg_readPixels_db685489e1779d63 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    }, arguments) };
    imports.wbg.__wbg_texImage2D_5b25282e44d0e3fe = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_cb339dd200dd1179 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_activeTexture_02b7c73c76c2c06b = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_attachShader_f4d51147351a1906 = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_bindBuffer_8b5135aa633680f5 = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindFramebuffer_080d0b0cf22e1645 = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindTexture_6f1dec563e82e818 = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_blendEquation_5d5abe2ee10109a9 = function(arg0, arg1) {
        getObject(arg0).blendEquation(arg1 >>> 0);
    };
    imports.wbg.__wbg_blendEquationSeparate_fa6aebc5cd0c5285 = function(arg0, arg1, arg2) {
        getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFunc_49ea28240d4c1084 = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFuncSeparate_9fef8acb74d50df5 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_checkFramebufferStatus_5c73e1e555100a17 = function(arg0, arg1) {
        const ret = getObject(arg0).checkFramebufferStatus(arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_clear_576f67967748e95f = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__wbg_clearColor_7489a3fbe484f2f1 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_clearDepth_eddf1eecd2e4a128 = function(arg0, arg1) {
        getObject(arg0).clearDepth(arg1);
    };
    imports.wbg.__wbg_clearStencil_6e5d2d97ae5b3523 = function(arg0, arg1) {
        getObject(arg0).clearStencil(arg1);
    };
    imports.wbg.__wbg_colorMask_bc13c97d0db65962 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_compileShader_22b038faa1f49857 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_createBuffer_6e747d928c9ba46d = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createFramebuffer_9b5b0507480146cd = function(arg0) {
        const ret = getObject(arg0).createFramebuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_1c5f8dffd1066e71 = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_4017d9fbc36659af = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_4ce49e8a8c655124 = function(arg0) {
        const ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_cullFace_aa9f8eea262690c0 = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_deleteBuffer_6fd9bca7f8a6d9de = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteFramebuffer_2617e39d2c39b4da = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteProgram_e8636e3cb5a18a59 = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_deleteShader_89369612f61ec145 = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_5c40169772519141 = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_depthFunc_2ac2c797a8220f09 = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__wbg_depthMask_88ab181c23c32dcd = function(arg0, arg1) {
        getObject(arg0).depthMask(arg1 !== 0);
    };
    imports.wbg.__wbg_disable_6835d16c2cd3fa26 = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__wbg_drawArrays_c0dcb4151e0bf007 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_drawElements_e09dbef58c8f099a = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    };
    imports.wbg.__wbg_enable_fc393941ac400f72 = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_3d21f4936ad4a378 = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_framebufferTexture2D_499d1c21458d0113 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__wbg_generateMipmap_19daae80e0a4f87a = function(arg0, arg1) {
        getObject(arg0).generateMipmap(arg1 >>> 0);
    };
    imports.wbg.__wbg_getActiveUniform_fd021da851153e8c = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getExtension_d270fbbd8529e85f = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getParameter_585a5b83c595ada8 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getParameter(arg1 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getProgramInfoLog_e47d5073d57fb18d = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getProgramParameter_eaf768a9b399b7cf = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_ec7e5b959e47645b = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getShaderParameter_42a35b974329561c = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getSupportedExtensions_7b5facfe54809102 = function(arg0) {
        const ret = getObject(arg0).getSupportedExtensions();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_8e9cc276a231ddcd = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_linkProgram_25cda5f9318ea316 = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_pixelStorei_bee1e2da4cb1115b = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_scissor_4b89b60091ee8f0e = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_shaderSource_a0001b8eab5d44f4 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_stencilFunc_b72fb7b1cdf11693 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilFunc(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_00541859199befd2 = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilOp_3db65a0f2e42c622 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).stencilOp(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_texParameteri_1b210b807f1ea723 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_uniform1i_50124a48de1da66b = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_useProgram_156511a425feb519 = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_vertexAttribPointer_63d2aef49627302b = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_viewport_a93f3881c4202d5e = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_debug_f15cb542ea509609 = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_ef9a0be47931175f = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_2874fdd5393f35ce = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_4b5638ad60bdc54a = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_58110c4a199df084 = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_instanceof_HtmlCanvasElement_97761617af6ea089 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof HTMLCanvasElement;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_setwidth_afb418d3fbf71ba7 = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_setheight_3eb8729b59493242 = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_getContext_a6ea7a8e317f182a = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_key_ad4fc49423a94efa = function(arg0, arg1) {
        const ret = getObject(arg1).key;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_code_06787cd3c7a60600 = function(arg0, arg1) {
        const ret = getObject(arg1).code;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_preventDefault_3209279b490de583 = function(arg0) {
        getObject(arg0).preventDefault();
    };
    imports.wbg.__wbg_stopPropagation_eca3af16f2d02a91 = function(arg0) {
        getObject(arg0).stopPropagation();
    };
    imports.wbg.__wbg_parentElement_0cffb3ceb0f107bd = function(arg0) {
        const ret = getObject(arg0).parentElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_appendChild_e513ef0e5098dfdd = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).appendChild(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_size_878ba1bf0c2ec606 = function(arg0) {
        const ret = getObject(arg0).size;
        return ret;
    };
    imports.wbg.__wbg_type_ca7819eaadc2049f = function(arg0) {
        const ret = getObject(arg0).type;
        return ret;
    };
    imports.wbg.__wbg_name_2473476082bed625 = function(arg0, arg1) {
        const ret = getObject(arg1).name;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_get_57245cc7d7c7619d = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_6e3bbe7c8bd4dbd8 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_newnoargs_b5b063fc6c2f0376 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_765201544a2b6869 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_97ae9d8645dc388b = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_0b9bfdd97583284e = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_6d479506f72c6a71 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_f2557cc78490aceb = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_7f206bda628d5286 = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_ba75c50d1cf384f4 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_getUTCDay_f2932aedf729504f = function(arg0) {
        const ret = getObject(arg0).getUTCDay();
        return ret;
    };
    imports.wbg.__wbg_getUTCFullYear_02542746403bbbae = function(arg0) {
        const ret = getObject(arg0).getUTCFullYear();
        return ret;
    };
    imports.wbg.__wbg_getUTCHours_2bd5d20b8526b272 = function(arg0) {
        const ret = getObject(arg0).getUTCHours();
        return ret;
    };
    imports.wbg.__wbg_getUTCMinutes_b4c6f5cb86f6ccbf = function(arg0) {
        const ret = getObject(arg0).getUTCMinutes();
        return ret;
    };
    imports.wbg.__wbg_getUTCMonth_7f697fbb1b6ca9c4 = function(arg0) {
        const ret = getObject(arg0).getUTCMonth();
        return ret;
    };
    imports.wbg.__wbg_getUTCSeconds_aa5d2f0ef6d97fca = function(arg0) {
        const ret = getObject(arg0).getUTCSeconds();
        return ret;
    };
    imports.wbg.__wbg_new0_a57059d72c5b7aee = function() {
        const ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_58886682b7e790d7 = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_buffer_3f3d764d4747d564 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_890b478c8d7226ff = function(arg0, arg1, arg2) {
        const ret = new Int8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_698c5100ae9c3365 = function(arg0, arg1, arg2) {
        const ret = new Int16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_7be13f49af2b2012 = function(arg0, arg1, arg2) {
        const ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_d9aa266703cb98be = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_5540e144e9b8b907 = function(arg0, arg1, arg2) {
        const ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_9cc9adccd861aa26 = function(arg0, arg1, arg2) {
        const ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_be22e5fcf4f69ab4 = function(arg0, arg1, arg2) {
        const ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_bf3f89b92d5a34bf = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper358 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 57, __wbg_adapter_24);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1188 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 339, __wbg_adapter_27);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1190 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 339, __wbg_adapter_27);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1192 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 339, __wbg_adapter_27);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1194 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 339, __wbg_adapter_27);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1196 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 339, __wbg_adapter_27);
        return addHeapObject(ret);
    };

    return imports;
}

function initMemory(imports, maybe_memory) {

}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedFloat64Memory0 = new Float64Array();
    cachedInt32Memory0 = new Int32Array();
    cachedUint8Memory0 = new Uint8Array();

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    const imports = getImports();

    initMemory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('chessgame-2264baef7cd3e26a_bg.wasm', import.meta.url);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}

export { initSync }
export default init;
