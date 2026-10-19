from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Resuable wait functions
def wait_for_visible(driver, by, selector, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((by, selector))
    )


def wait_for_clickable(driver, by, selector, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((by, selector))
    )


def click_when_ready(driver, by, selector, timeout=10):
    driver.wait_for_clickable(by, selector, timeout).click()