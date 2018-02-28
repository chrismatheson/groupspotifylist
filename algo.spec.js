const expect = require('expect');
const algo = require('./algo');

describe('algo', function () {
  it('should concat lists', function name() {
    const parts = {
      chris: [
        "spotify:track:0qwCl8IsviFwXsbxrXbjCE",
        "spotify:track:3vmOEg3JBiNxaz0mHxPSPC",
      ],
      sauce: [
        "spotify:track:2Y90nL1ohB4sgYELDs7uNx",
        "spotify:track:5Px0B05xYkSi11zu6c4IPx",
      ],
      sav: [
        "spotify:track:6b8IKVufOkAawvQVguQxmo",
        "spotify:track:6IWkdrBY2O0vfQdfEKGUdF",
      ]
    };

    expect(algo(parts)).toEqual([
      "spotify:track:0qwCl8IsviFwXsbxrXbjCE",
      "spotify:track:3vmOEg3JBiNxaz0mHxPSPC",
      "spotify:track:2Y90nL1ohB4sgYELDs7uNx",
      "spotify:track:5Px0B05xYkSi11zu6c4IPx",
      "spotify:track:6b8IKVufOkAawvQVguQxmo",
      "spotify:track:6IWkdrBY2O0vfQdfEKGUdF",
    ]);
  });

  it('should dedupe', function name() {
    const parts = {
      chris: [
        "spotify:track:0qwCl8IsviFwXsbxrXbjCE"
      ],
      sauce: [
        "spotify:track:0qwCl8IsviFwXsbxrXbjCE"
      ]
    };

    expect(algo(parts)).toEqual([
      "spotify:track:0qwCl8IsviFwXsbxrXbjCE"
    ]);
  });

    it('should fill in missing', function name() {
        const parts = {
            chris: [
                "spotify:track:0qwCl8IsviFwXsbxrXbjCE",
                "spotify:track:3vmOEg3JBiNxaz0mHxPSPC",
                "spotify:track:2Y90nL1ohB4sgYELDs7uNx",
            ],
            sauce: [
                "spotify:track:5Px0B05xYkSi11zu6c4IPx",
            ],
            sav: [
                "spotify:track:6b8IKVufOkAawvQVguQxmo",
                "spotify:track:6IWkdrBY2O0vfQdfEKGUdF",
            ]
        };

        expect(algo(parts)).toEqual([
            "spotify:track:0qwCl8IsviFwXsbxrXbjCE",
            "spotify:track:3vmOEg3JBiNxaz0mHxPSPC",
            "spotify:track:2Y90nL1ohB4sgYELDs7uNx",
            "spotify:track:5Px0B05xYkSi11zu6c4IPx",
            "spotify:track:6b8IKVufOkAawvQVguQxmo",
            "spotify:track:6IWkdrBY2O0vfQdfEKGUdF",
        ]);
    });
});
