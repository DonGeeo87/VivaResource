import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Viva Resource Foundation/);
  });

  test('should display hero section content', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Building Hope for Tomorrow|Construyendo Esperanza/)).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    const aboutLink = page.getByRole('link', { name: /About Us|Nosotros/i });
    await expect(aboutLink).toBeVisible();
    
    const resourcesLink = page.getByRole('link', { name: /Resources|Recursos/i });
    await expect(resourcesLink).toBeVisible();
    
    const donateLink = page.getByRole('link', { name: /Donate|Donar/i });
    await expect(donateLink).toBeVisible();
  });

  test('should have language toggle', async ({ page }) => {
    await page.goto('/');
    const langToggle = page.getByRole('button', { name: /EN|ES/i });
    await expect(langToggle).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /About Us|Nosotros/i }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page).toHaveTitle(/About|Nosotros/i);
  });

  test('should navigate to resources page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Resources|Recursos/i }).click();
    await expect(page).toHaveURL(/\/resources/);
  });

  test('should navigate to donate page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Donate|Donar/i }).click();
    await expect(page).toHaveURL(/\/donate/);
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Contact/i }).click();
    await expect(page).toHaveURL(/\/contact/);
  });
});

test.describe('About Page', () => {
  test('should display mission and vision sections', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText(/Our Mission|Nuestra Misi\u00f3n/i)).toBeVisible();
    await expect(page.getByText(/Our Vision|Nuestra Visi\u00f3n/i)).toBeVisible();
  });

  test('should display team members', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText(/Meet Our Team|Conoce Nuestro Equipo/i)).toBeVisible();
  });
});

test.describe('Blog Page', () => {
  test('should load blog page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveTitle(/Blog/i);
  });
});

test.describe('Contact Page', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('textbox', { name: /First Name|Nombre/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Message|Mensaje/i })).toBeVisible();
  });

  test('should show newsletter subscription', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByText(/newsletter/i)).toBeVisible();
  });
});

test.describe('404 Page', () => {
  test('should show custom 404 for non-existent routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    await expect(page.getByText(/404|Not Found|No Encontrado/i)).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have skip link for accessibility', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeVisible();
  });

  test('should have valid semantic HTML', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toHaveCount(1);
    
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    const footer = page.locator('footer');
    await expect(footer).toHaveCount(1);
  });
});

test.describe('Responsive', () => {
  test('should render on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByText(/Building Hope|Construyendo Esperanza/i)).toBeVisible();
  });

  test('should render on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.getByText(/Building Hope|Construyendo Esperanza/i)).toBeVisible();
  });
});
