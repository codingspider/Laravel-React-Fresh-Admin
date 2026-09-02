import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import api from '../../axios';
import { WEBSITE_SETTINGS, FAQS_API, PLANS_PUBLIC } from '../../routes/apiRoutes';
import LandingNavbar from './sections/LandingNavbar';
import LandingHero from './sections/LandingHero';
import LandingFeatures from './sections/LandingFeatures';
import LandingHowItWorks from './sections/LandingHowItWorks';
import LandingBusinessTypes from './sections/LandingBusinessTypes';
import LandingComparison from './sections/LandingComparison';
import LandingPricing from './sections/LandingPricing';
import LandingFaq from './sections/LandingFaq';
import LandingCta from './sections/LandingCta';
import LandingFooter from './sections/LandingFooter';

const defaultSettings = {
    site_name: 'Restaurant POS',
    site_tagline: 'Run your entire restaurant from one powerful platform',
    hero_badge: 'Trusted by 500+ restaurants',
    hero_title: 'The smartest way to run your restaurant',
    hero_subtitle: 'Take orders, process payments, manage tables and track everything in real time. All-in-one POS, kitchen, inventory and analytics for dine-in, takeaway, delivery and room service.',
    hero_primary_cta_text: 'Start Free Trial',
    hero_primary_cta_url: '/register',
    hero_secondary_cta_text: 'Explore Features',
    hero_secondary_cta_url: '#features',
    stat_1_value: '0%',
    stat_1_label: 'Transaction fees',
    stat_2_value: '4',
    stat_2_label: 'Order types supported',
    stat_3_value: '<2s',
    stat_3_label: 'Order to kitchen',
    stat_4_value: '99.9%',
    stat_4_label: 'Uptime guarantee',
    contact_email: 'support@example.com',
    contact_phone: '+1 234 567 890',
    contact_address: '123 Main Street, New York, NY 10001',
    social_facebook: null,
    social_twitter: null,
    social_instagram: null,
    social_linkedin: null,
    social_youtube: null,
    footer_about: 'The complete restaurant management platform.',
    copyright_text: 'All rights reserved.',
};

export default function LandingPage() {
    const [settings, setSettings] = useState(defaultSettings);
    const [faqs, setFaqs] = useState([]);
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        let active = true;
        api.get(WEBSITE_SETTINGS)
            .then((res) => {
                if (active) {
                    setSettings({ ...defaultSettings, ...(res.data?.data || {}) });
                }
            })
            .catch(() => {
                if (active) setSettings(defaultSettings);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (settings.site_logo) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = settings.site_logo;
            link.type = settings.site_logo.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
        }
    }, [settings.site_logo]);

    useEffect(() => {
        let active = true;
        api.get(FAQS_API)
            .then((res) => {
                if (active) setFaqs(res.data?.data || []);
            })
            .catch(() => {
                if (active) setFaqs([]);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        api.get(PLANS_PUBLIC)
            .then((res) => {
                if (active) setPlans(res.data?.data || []);
            })
            .catch(() => {
                if (active) setPlans([]);
            });
        return () => {
            active = false;
        };
    }, []);

    return (
        <Box bg="gray.50" minH="100vh" _dark={{ bg: 'gray.900' }}>
            <LandingNavbar settings={settings} />
            <main>
                <LandingHero settings={settings} />
                <LandingFeatures />
                <LandingHowItWorks />
                <LandingBusinessTypes />
                <LandingComparison
                    rows={settings?.comparison_rows || []}
                    platformLabel={settings?.comparison_platform_label}
                    othersLabel={settings?.comparison_others_label}
                />
                <LandingPricing plans={plans} />
                <LandingFaq faqs={faqs} />
                <LandingCta settings={settings} />
            </main>
            <LandingFooter settings={settings} />
        </Box>
    );
}
