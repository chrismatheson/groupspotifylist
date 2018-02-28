const expect = require('expect');
const algo = require('./algo');
const { difference } = require('lodash/fp')

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
                "spotify:track:7vmLW0qZn0vBgH6WN7ZAnC",
                "spotify:track:16TnprliADBNA3YJFaNM2c",
                "spotify:track:1ZmSWeVoOZZwL0GkpGV8J2",
                "spotify:track:4aXYEBKgAk2IXl31wTE3IK",
            ]
        };

        expect(algo(parts, 2).length).toEqual(6);
        expect(algo(parts, 2)).toContain("spotify:track:0qwCl8IsviFwXsbxrXbjCE");
        expect(algo(parts, 2)).toContain("spotify:track:3vmOEg3JBiNxaz0mHxPSPC");
        expect(algo(parts, 2)).toContain("spotify:track:2Y90nL1ohB4sgYELDs7uNx");
        expect(algo(parts, 2)).toContain("spotify:track:5Px0B05xYkSi11zu6c4IPx");
        expect(algo(parts, 2)).toContain("spotify:track:6b8IKVufOkAawvQVguQxmo");
        expect(algo(parts, 2)).toContain("spotify:track:6IWkdrBY2O0vfQdfEKGUdF");
    });
});
