var rules = {
"default": {
    "radio": {
        "value": "A1"
    },
    "checkbox1": {
        "disabled": true,
        "checked": false
    },
    "checkbox2": {
        "disabled": true,
        "checked": false
    },
    "checkbox3": {
        "disabled": true,
        "checked": false
    },
    "textbox1": {
        "disabled": true,
        "value": "",
        "background-color": ""
    },
    "textbox2": {
        "disabled": true,
        "value": "",
        "background-color": ""
    },
    "textbox3": {
        "disabled": true,
        "value": "",
        "background-color": ""
    }
},
"#1": {
    "when": {
        "radio": {
            "value": "A1"
        },
        "select1": {
            "value": ">=2"
        }
    },
    "then": {
        "textbox1": {
            "disabled": false,
            "value": ""
        }
    }
},
"#2": {
    "when": {
        "select1": {
            "value": "1"
        }
    },
    "then": {
        "textbox2": {
            "disabled": false,
            "value": "\"some\/ \ntext\"\n he\\re"
        }
    }
},
"#3": {
    "when": {
        "radio": {
            "value": "A2"
        }
    },
    "then": {
        "checkbox1": {
            "disabled": false
        },
        "checkbox2": {
            "disabled": false
        },
        "checkbox3": {
            "disabled": false
        },
        "textbox3": {
            "disabled": false,
            "value": function(src, self) { return !self.value ? "hey" : self.value; },
            "background-color": "#ffff00"
        },
        "select1": {
            "value": "2"
        },
        "select5": {
            "value": "1"
        }
    }
},
"#4": {
    "when": {
        "radio": {
            "value": "A3"
        }
    },
    "then": {
        "select1": {
            "value": "3"
        },
        "select5": {
            "value": "2"
        }
    }
},
"#5": {
    "when": {
        "radio": {
            "value": "A2"
        },
        "checkbox1": {
            "checked": true
        },
        "checkbox2": {
            "checked": true
        },
        "checkbox3": {
            "checked": true
        }
    },
    "then": {
        "textbox2": {
            "disabled": false,
            "background-color": "#ff00ff"
        },
        "select1": {
            "value": "3"
        }
    }
},
"#6": {
    "when": {
        "textbox3": {
            "disabled": false,
            "value": ""
        }
    },
    "then": {
        "textbox3": {
            "background-color": "#ff0000"
        }
    }
},
"#7": {
    "when": {
        "textbox3": {
            "disabled": false,
            "value": "!="
        }
    },
    "then": {
        "textbox3": {
            "background-color": "#00ffff"
        }
    }
}
};
























