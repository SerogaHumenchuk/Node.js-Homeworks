class TimersManager {
  constructor() {
    this.timers = [];
    this.logs = [];
  }


  add(timerProps, ...cbArgs) {
    this.validate(timerProps);

    const {interval, job, delay, name} = timerProps;
    const timer = {
      ...timerProps,
      setAction() {
        this.timerData = interval ? setInterval(job, delay, ...cbArgs) : setTimeout(job, delay, ...cbArgs)
      },
      clearAction() {
        interval ? clearInterval(this.timerData) : clearTimeout(this.timerData)
      },
    }
    this.timers = [...this.timers, timer];
    this.log({name, in: cbArgs, out: job(...cbArgs), created: Date.now()});
    return this
  }

  remove(timerProps) {
    this.timers = this.timers.filter(timer => {
      if (timer.name === timerProps.name) {
        timer.clearAction()
        return
      }
      return timer
    })
  }

  start() {
    this.timers.forEach(timer => {
      timer.setAction();
    })
  }

  stop() {
    this.timers.forEach(timer => {
      timer.clearAction()
    })
  }

  pause(timerProps) {
    this.timers.forEach((timer) => {
      if (timer.name === timerProps.name) {
        timer.clearAction()
      }
    })
  }

  resume(timerProps) {
    this.timers.forEach(timer => {
      if (timerProps.name === timer.name) {
        timer.setAction();
      }
    })
  }

  validate({name, delay, interval, job}) {
    const errors = [];

    const isAnyTimoutStarted = !!this.timers.find(({timerData}) => timerData && !timerData._destroyed);
    if (isAnyTimoutStarted) {
      errors.push('Timers already started. ')
    }
    if (!(name && name.length)) {
      errors.push('Timer name is not valid. ')
    }
    if (typeof delay !== 'number' || delay < 0 || delay > 5000) {
      errors.push('Timer delay is not valid. ')
    }
    if (typeof interval !== 'boolean') {
      errors.push('Timer interval is not valid. ')
    }
    if (typeof job !== 'function') {
      errors.push('Timer job is not valid. ')
    }
    const isTimerNameNotUniq = this.timers.find(timer => timer.name === name)
    if (isTimerNameNotUniq) {
      errors.push(`Timer name should be uniq. `)
    }

    if (errors.length) {
      const error = errors.reduce((acc, error) => acc + error, '');
      this.log(error);
      throw error;
    }
    return null
  }

  log(newLog) {
    this.logs = [...this.logs, newLog]
  }

  print() {
    console.log(this.logs)
  }

}

// test me here
const manager = new TimersManager();

const t2 = {
  name: 't2',
  delay: 3000,
  interval: true,
  job: (a, b) => a + b,
};

console.log('start ', manager)

manager.add(t2, 1, 2)
manager.start();
// manager.pause(t1);
manager.stop();

console.log('end ', manager)
