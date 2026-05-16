from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
import config
from main import run_announcement

scheduler = BlockingScheduler(timezone="America/Chicago")  # <-- UPDATE timezone to match your city
scheduler.add_job(
    run_announcement,
    CronTrigger(hour=config.ANNOUNCE_HOUR, minute=config.ANNOUNCE_MINUTE),
)

print(
    f"Scheduler running. Weather announcement will play at "
    f"{config.ANNOUNCE_HOUR:02d}:{config.ANNOUNCE_MINUTE:02d} daily. "
    f"Press Ctrl+C to stop."
)

try:
    scheduler.start()
except KeyboardInterrupt:
    print("Scheduler stopped.")
