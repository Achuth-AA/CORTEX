load("//javascript/angular2:build_defs.bzl", "ng_module")
load("//javascript/typescript:build_defs.bzl", "ts_library")
load("//testing/web/build_defs/js_test:js_test_suite.bzl", "js_test_suite")

ts_library(
    name = "bug_suggestion_search",
    srcs = ["bug_suggestion_search.ts"],
    deps = [
        ":bug_suggestion",
        ":bug_suggestion_forms",
        "//third_party/javascript/rxjs",
    ],
)

ng_module(
    name = "bug_suggestion_search_tests",
    testonly = True,
    srcs = ["bug_suggestion_search_test.ts"],
    deps = [
        ":bug_suggestion",
        ":bug_suggestion_search",
        "//third_party/javascript/angular2:core",
        "//third_party/javascript/angular2:forms",
        "//third_party/javascript/rxjs",
        "//third_party/javascript/typings/jasmine",
    ],
)

js_test_suite(
    name = "bug_suggestion_search_test",
    environments = ["//java/com/google/search/xep/ties/tools/sptr/app:desktop-light-en-chrome-linux"],
    test_lib = ":bug_suggestion_search_tests",
)

package(default_visibility = [
    "//java/com/google/search/xep/ties/tools/sptr/app:__subpackages__",
    "//java/com/google/search/xep/ties/tools/sptr/ui:__subpackages__",
])

ng_module(
    name = "bug_suggestion",
    srcs = [
        "bug_suggestion_config.ts",
        "bug_suggestion_subscriptions.ts",
        "bug_suggestion_types.ts",
    ],
    legacy_optional_chaining = True,
    deps = [
        "//third_party/javascript/angular2:core",
        "//third_party/javascript/angular2:core_rxjs_interop",
        "//third_party/javascript/angular2:forms",
        "//third_party/javascript/rxjs",
    ],
)

ng_module(
    name = "bug_suggestion_ai",
    srcs = ["bug_suggestion_ai.ts"],
    legacy_optional_chaining = True,
    deps = [
        "//third_party/javascript/angular2:common_http",
        "//third_party/javascript/angular2:core",
        "//third_party/javascript/angular2:forms",
        "//third_party/javascript/rxjs",
    ],
)

ng_module(
    name = "bug_suggestion_ai_tests",
    testonly = True,
    srcs = ["bug_suggestion_ai_test.ts"],
    legacy_optional_chaining = True,
    deps = [
        ":bug_suggestion",
        ":bug_suggestion_ai",
        "//third_party/javascript/angular2:common_http",
        "//third_party/javascript/angular2:core",
        "//third_party/javascript/angular2:forms",
        "//third_party/javascript/rxjs",
        "//third_party/javascript/typings/jasmine",
    ],
)

js_test_suite(
    name = "bug_suggestion_ai_test",
    environments = ["//java/com/google/search/xep/ties/tools/sptr/app:desktop-light-en-chrome-linux"],
    test_lib = ":bug_suggestion_ai_tests",
)

ng_module(
    name = "bug_suggestion_forms",
    srcs = [
        "bug_suggestion_create.ts",
        "bug_suggestion_forms.ts",
        "bug_suggestion_utils.ts",
    ],
    legacy_optional_chaining = True,
    deps = [
        ":bug_suggestion",
        "//third_party/javascript/angular2:core",
        "//third_party/javascript/angular2:core_rxjs_interop",
        "//third_party/javascript/angular2:forms",
    ],
)

ng_module(
    name = "bug_suggestion_forms_tests",
    testonly = True,
    srcs = ["bug_suggestion_forms_test.ts"],
    legacy_optional_chaining = True,
    deps = [
        ":bug_suggestion",
        ":bug_suggestion_forms",
        "//third_party/javascript/angular2:core",
        "//third_party/javascript/angular2:forms",
        "//third_party/javascript/typings/jasmine",
    ],
)

js_test_suite(
    name = "bug_suggestion_forms_test",
    environments = ["//java/com/google/search/xep/ties/tools/sptr/app:desktop-light-en-chrome-linux"],
    test_lib = ":bug_suggestion_forms_tests",
)

ng_module(
    name = "bug_suggestion_utils_tests",
    testonly = True,
    srcs = ["bug_suggestion_utils_test.ts"],
    deps = [
        ":bug_suggestion",
        ":bug_suggestion_forms",
        "//third_party/javascript/angular2:core",
        "//third_party/javascript/angular2:forms",
        "//third_party/javascript/typings/jasmine",
    ],
)

js_test_suite(
    name = "bug_suggestion_utils_test",
    environments = ["//java/com/google/search/xep/ties/tools/sptr/app:desktop-light-en-chrome-linux"],
    test_lib = ":bug_suggestion_utils_tests",
)

ng_module(
    name = "bug_suggestion_create_tests",
    testonly = True,
    srcs = ["bug_suggestion_create_test.ts"],
    legacy_optional_chaining = True,
    deps = [
        ":bug_suggestion",
        ":bug_suggestion_forms",
        "//third_party/javascript/angular2:core",
        "//third_party/javascript/angular2:forms",
        "//third_party/javascript/rxjs",
        "//third_party/javascript/typings/jasmine",
    ],
)

js_test_suite(
    name = "bug_suggestion_create_test",
    environments = ["//java/com/google/search/xep/ties/tools/sptr/app:desktop-light-en-chrome-linux"],
    test_lib = ":bug_suggestion_create_tests",
)
