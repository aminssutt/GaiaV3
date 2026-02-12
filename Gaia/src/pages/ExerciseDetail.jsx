import React from 'react';
import VideoPlayer from '../components/VideoPlayer';
import './ExerciseDetail.css';

const exerciseData = {
  neck: {
    title: 'Neck Relief Stretches',
    videoUrl: 'https://www.youtube.com/embed/X3-gKPNyrTA?si=dbOm9CYstblhRulW',
    description: 'These gentle stretches are designed to relieve tension and improve flexibility in your neck. Perform them slowly and avoid any movements that cause pain.',
    instructions: [
      'Neck Tilt: Gently tilt your head towards your right shoulder, hold for 15-30 seconds. Repeat on the left side.',
      'Neck Turn: Slowly turn your head to the right, hold for 15-30 seconds. Repeat on the left side.',
      'Forward and Backward Tilt: Tilt your head down to your chest, then look up towards the ceiling. Hold each position for 15 seconds.',
      'Shoulder Rolls: Roll your shoulders backwards and forwards in a circular motion 5 times each way.'
    ]
  },
  back: {
    title: 'Back Strengthening Exercises',
    videoUrl: 'https://www.youtube.com/embed/2eA2Koq6pTI?si=3GfO9yaH9KxR861A',
    description: 'A strong back is crucial for good posture and preventing injuries. These exercises will help you build a resilient back.',
    instructions: [
      'Cat-Cow Stretch: Start on your hands and knees. Inhale as you drop your belly and look up (Cow). Exhale as you round your spine and tuck your chin (Cat). Repeat 10 times.',
      'Bird-Dog: From hands and knees, extend your right arm forward and your left leg back. Hold for a few seconds, then switch sides. Do 10 reps per side.',
      'Bridge: Lie on your back with knees bent. Lift your hips off the floor until your body forms a straight line from shoulders to knees. Hold for 20-30 seconds.',
      'Child\'s Pose: Kneel on the floor, sit back on your heels, and fold forward, resting your forehead on the floor. Hold for 30-60 seconds.'
    ]
  },
  legs: {
    title: 'Leg Strengthening Exercises',
    videoUrl: 'https://www.youtube.com/watch?v=2eA2Koq6pTI',
    description: 'Strong legs are essential for overall mobility and stability. These exercises will help you build leg strength.',
    instructions: [
      'Squats: Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair, keeping your chest up. Hold for a moment, then return to standing. Repeat 10-15 times.',
      'Lunges: Step forward with one leg and lower your hips until both knees are bent at about a 90-degree angle. Push back to the starting position and switch legs. Do 10 reps per leg.'
    ]
  },
  wrists: {
    title: 'Wrist Mobility & Relief',
    videoUrl: 'https://www.youtube.com/embed/T9H_yu0Me8c?si=-eO9kVkKu2pYTh0k',
    description: 'Gentle, equipment-free moves to reduce stiffness and improve wrist mobility. Great for typing breaks or while seated indoors or in a parked vehicle.',
    instructions: [
      'Wrist Circles: Hold forearms still and draw slow circles with both hands for 10 reps clockwise, then 10 reps counterclockwise.',
      'Prayer Stretch: Press palms together at chest height, elbows out. Slowly lower hands until you feel a stretch in the wrists and forearms. Hold 20-30 seconds.',
      'Reverse Prayer (Hands Back-to-Back): Place backs of hands together at chest height and gently lift elbows. Hold 20-30 seconds—stay pain-free.',
      'Fist Openers: Make a fist tightly for 2 seconds, then spread fingers wide for 2 seconds. Repeat 10-15 times.',
      'Desk/Steering Support Stretch: Place palm on a surface with fingers pointing toward you; lean gently to stretch forearm flexors. Hold 15-20 seconds per side.'
    ]
  },
  shoulders: {
    title: 'Shoulder Mobility Reset',
    videoUrl: 'https://www.youtube.com/embed/1KJrELeqq_o?si=e3hNwzpVpJpXq8v6',
    description: 'Loosen tight shoulders and upper back with safe, small-range movements. Suitable standing or seated (indoors or in a parked vehicle).',
    instructions: [
      'Shoulder Rolls: Lift shoulders up, roll back and down in a smooth circle. Do 10 reps, then 10 reps forward.',
      'Scapular Squeezes: Pinch shoulder blades gently together for 3 seconds, then release. Repeat 10-15 times.',
      'Cross-Body Stretch: Bring right arm across chest; support with left hand above the elbow. Hold 20-30 seconds. Switch arms.',
      'Overhead Reach (if space allows): Interlace fingers, turn palms up, and reach overhead. Keep ribs down. Hold 10-15 seconds, repeat 3 times.',
      'Neck-Shoulder Side Tilt: Ear toward shoulder (no shrug), feel a gentle stretch along the side of the neck/upper shoulder. Hold 15-20 seconds per side.'
    ]
  },
  arms: {
    title: 'Arm Activation (Light Strength)',
    videoUrl: 'https://www.youtube.com/embed/-zhIzavPn48?si=rKzrdIFB8K5GsybB',
    description: 'Activate biceps, triceps, and forearms with light, controlled movements you can do anywhere without equipment.',
    instructions: [
      'Isometric Biceps Squeeze: Elbow at 90°. Pull your palm up into the other hand for 5 seconds, then relax. 6-8 reps per arm.',
      'Triceps Press: Place palm on the back of the opposite hand and push down gently while resisting for 5 seconds. 6-8 reps per arm.',
      'Arm Circles: Extend arms to sides and make small circles forward for 20 seconds, then backward for 20 seconds. Keep shoulders relaxed.',
      'Forearm Flex/Extend: With elbow at side, slowly bend and straighten at the elbow for 10-15 reps per arm—smooth tempo.',
      'Grip Pulses: Squeeze a soft object (or fist) for 2 seconds, release for 2 seconds. 10-15 reps per hand.'
    ]
  },
  breathing: {
    title: 'Breathing for Relaxation & Focus',
    videoUrl: 'https://www.youtube.com/embed/3GxTxQJpoyg?si=Rv6-TtPe_PLyfwFE',
    description: 'Simple breathing drills to reduce stress and improve focus. Best done seated, eyes open, in a calm, parked environment.',
    instructions: [
      'Posture Reset: Sit tall with feet grounded and shoulders relaxed. Place one hand on chest and one on belly.',
      'Diaphragmatic Breathing: Inhale through the nose for 4 counts (belly rises), exhale through the nose for 6 counts. Repeat 6-8 cycles.',
      'Box Breathing: Inhale 4 counts, hold 4, exhale 4, hold 4. Keep the breath smooth. Do 4-6 rounds.',
      'Pursed-Lip Exhale: Inhale gently through the nose, exhale through pursed lips for twice as long as the inhale. 5-8 breaths.',
      'Quick Reset: 3 slow breaths—lengthen the exhale each time. Notice shoulders relaxing and jaw unclenching.'
    ]
  },

};

function ExerciseDetail({ onNavigate, exerciseId }) {
  const data = exerciseData[exerciseId] || { title: 'Not Found', description: 'Exercise not found.', instructions: [], videoUrl: '' };

  return (
    <div className="exercise-detail-page fade-in">
      <div className="exercise-detail-header">
        <button className="back-btn" onClick={() => onNavigate('exercises')}>
          ← Back to Exercises
        </button>
        <h1>{data.title}</h1>
      </div>
      <div className="exercise-detail-content">
        <div className="video-player-container">
          <VideoPlayer videoUrl={data.videoUrl} title={data.title} />
        </div>
        <div className="instructions-container">
          <h3>Instructions</h3>
          <p>{data.description}</p>
          <ul>
            {data.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetail;

