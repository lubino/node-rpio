{
  "targets": [
    {
      "target_name": "npio",
      "include_dirs": [ "<!(node -e \"require('nan')\")" ],
      "sources": [
        "src/bcm2835.c",
        "src/sunxi.c",
        "src/npio.cc"
      ]
    }
  ]
}
