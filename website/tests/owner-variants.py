"""Build isolated acceptance variants without changing the production source.

Checks the data switches and the rarely used flight/promotion render paths.
The fixture uses synthetic prices only in a temporary, unpublished build.
"""
from pathlib import Path
import json
import os
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def run():
    with tempfile.TemporaryDirectory(prefix="pardus-owner-variants-") as directory:
        fixture = Path(directory)
        shutil.copytree(ROOT / "src", fixture / "src")
        for file in ["package.json", "astro.config.mjs", "tsconfig.json"]:
            shutil.copy2(ROOT / file, fixture / file)
        (fixture / "node_modules").symlink_to(ROOT / "node_modules", target_is_directory=True)
        (fixture / "public").symlink_to(ROOT / "public", target_is_directory=True)
        config = fixture / "src/data/site.ts"
        config.write_text(config.read_text().replace("storyVoice: 'first-person' as", "storyVoice: 'third-person' as").replace("showFounder: true", "showFounder: false"))
        offers = fixture / "src/data/offers.ts"
        offers.write_text(offers.read_text() + """
// Synthetic test data in an isolated acceptance build; never published.
const flightFixture = offers.find(offer => offer.slug === 'seychelles')!;
flightFixture.components.flights = 'included';
flightFixture.previousPardusPrice = { amount: 3000, currency: 'USD', verified: true };
flightFixture.promotionWindow = { startsOn: '2000-01-01', endsOn: '2099-12-31' };
offers.find(offer => offer.slug === 'maasai-mara')!.fromUSD = 99999;
""")
        environment = {**os.environ, "PARDUS_BASE": "/acceptance/", "PARDUS_SITE": "https://pardusescapes.com"}
        result = subprocess.run(["node", str(ROOT / "node_modules/astro/bin/astro.mjs"), "build"], cwd=fixture,
            env=environment, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        assert result.returncode == 0, result.stdout
        about = (fixture / "dist/about/index.html").read_text()
        listing = (fixture / "dist/destinations/index.html").read_text()
        flight = (fixture / "dist/destination-seychelles/index.html").read_text()
        unapproved = (fixture / "dist/destination-maasai-mara/index.html").read_text()
        assert 'data-about-section="founder"' not in about
        assert '"founder":' not in about
        assert "data-founder-portrait" not in about
        assert "The founder wanted a name that was distinctive" in about
        assert "I wanted a name that was distinctive" not in about
        warning = 'Airfares may change until the ticket is issued.'
        assert warning in listing and warning in flight
        assert '/acceptance/terms/#fares' in listing and '/acceptance/terms/#fares' in flight
        assert '<del>Was USD 3,000</del>' in listing and '<del>Was USD 3,000</del>' in flight
        assert 'datetime="2000-01-01"' in flight and 'datetime="2099-12-31"' in flight
        assert 'Request a quote' in unapproved and '99,999' not in unapproved and '99999' not in unapproved
        record = {"founderHidden": True, "thirdPersonExact": True, "flightWarningRendered": True,
            "genuinePromotionRendered": True, "unapprovedNumericPriceHidden": True, "productionSourceChanged": False}
        output = Path(os.environ.get("PARDUS_QA_OUTPUT", "/workspace/pardus-qa"))
        output.mkdir(parents=True, exist_ok=True)
        (output / "owner-variants.json").write_text(json.dumps(record, indent=2))
        print("PASS isolated build variants: founder hidden, approved third-person story, flight notice, genuine promotion and unapproved numeric-price suppression", flush=True)


if __name__ == "__main__":
    run()
